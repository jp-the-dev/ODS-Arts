<?php

namespace App\Console\Commands;

use App\Models\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Move seeded catalogue images onto the Laravel public disk.
 *
 * Seeded rows store a storefront-relative path (/images/...) pointing at the
 * Next.js public folder. That renders on the storefront but is invisible to the
 * admin panel, which is served from the API origin — and, more importantly, the
 * uploader cannot load a file that is not on the disk it writes to, so those
 * images can be looked at but never replaced.
 *
 * Production has no Next.js public folder to fall back on: every catalogue image
 * an admin manages lives on the disk. This makes local match that.
 *
 * Idempotent — rows already on the disk are left alone, so it is safe to re-run.
 */
class ImagesToDisk extends Command
{
    protected $signature = 'odsarts:images-to-disk
                            {--dry-run : Report what would move without changing anything}';

    protected $description = 'Copy seeded storefront images onto the public disk so the admin can manage them';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $disk = Storage::disk('public');
        // The storefront is a sibling of the Laravel app, not a child of it —
        // base_path() is backend/, so the frontend sits one level up.
        $sourceRoot = base_path('../frontend/public');

        $pending = ProductImage::query()->where('path', 'like', '/%')->get();

        if ($pending->isEmpty()) {
            $this->info('  Nothing to move — every image is already on the disk.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->line("  <options=bold>{$pending->count()}</> image".($pending->count() === 1 ? '' : 's').' still served from the storefront folder.');
        if ($dryRun) {
            $this->line('  <fg=yellow>Dry run — nothing will be written.</>');
        }
        $this->newLine();

        $moved = 0;
        $missing = [];

        // The seeder reuses the same workshop and lifestyle shots across several
        // products, but each row still gets its own copy so that replacing or
        // deleting one product's image cannot affect another's. StoredImage also
        // refuses to delete a path another row still references, so the two
        // guards overlap deliberately.
        foreach ($pending as $image) {
            $source = $sourceRoot.$image->path;

            if (! is_file($source)) {
                $missing[] = $image->path;
                $this->line(sprintf('  <fg=red>✗</> #%-3s %s <fg=gray>(no such file)</>', $image->id, $image->path));

                continue;
            }

            $target = 'products/'.Str::random(26).'.'.pathinfo($source, PATHINFO_EXTENSION);
            $from = $image->path;

            if (! $dryRun) {
                $disk->put($target, (string) file_get_contents($source));
                $image->update(['path' => $target]);
            }

            $this->line(sprintf('  <fg=green>✓</> #%-3s %s <fg=gray>→ %s</>', $image->id, $from, $target));
            $moved++;
        }

        $this->newLine();
        $this->info("  {$moved} moved, ".count($missing).' unresolved.');

        if ($missing !== []) {
            $this->newLine();
            $this->warn('  These paths reference files that do not exist in frontend/public.');
            $this->line('  <fg=gray>They are broken on the storefront too — fix the seeder or re-upload in the admin.</>');
        }

        $this->newLine();

        return self::SUCCESS;
    }
}
