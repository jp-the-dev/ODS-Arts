<?php

namespace App\Services;

/**
 * What the server will actually accept for an upload.
 *
 * PHP enforces upload_max_filesize and post_max_size before Laravel is reached,
 * so a form advertising a larger limit than PHP allows rejects the file with no
 * useful message — the request arrives with an empty $_FILES and looks like the
 * upload simply failed. Deriving the form's limit from the ini values means the
 * validation message is always the honest one.
 */
final class UploadLimits
{
    /** The size we want to accept, before the server's own ceiling applies. */
    public const PREFERRED_KILOBYTES = 5120;

    public static function maxKilobytes(): int
    {
        $limits = array_filter([
            self::iniKilobytes('upload_max_filesize'),
            self::iniKilobytes('post_max_size'),
        ]);

        return $limits === []
            ? self::PREFERRED_KILOBYTES
            : (int) min(self::PREFERRED_KILOBYTES, min($limits));
    }

    /** True when PHP, not our own preference, is the binding constraint. */
    public static function isConstrainedByServer(): bool
    {
        return self::maxKilobytes() < self::PREFERRED_KILOBYTES;
    }

    public static function describe(): string
    {
        $kb = self::maxKilobytes();

        return $kb >= 1024
            ? round($kb / 1024, 1).'MB'
            : $kb.'KB';
    }

    /**
     * Parse a shorthand ini value ("2M", "512K", "1G") into kilobytes.
     *
     * A value of 0 or -1 means unlimited, which is not a ceiling at all.
     */
    private static function iniKilobytes(string $directive): ?int
    {
        $raw = trim((string) ini_get($directive));

        if ($raw === '') {
            return null;
        }

        $value = (int) $raw;

        if ($value <= 0) {
            return null;
        }

        return match (strtoupper(substr($raw, -1))) {
            'G' => $value * 1024 * 1024,
            'M' => $value * 1024,
            'K' => $value,
            default => (int) ($value / 1024),
        };
    }
}
