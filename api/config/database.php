<?php
/**
 * Database Connection (PDO Singleton)
 */
class Database {
    private static ?PDO $instance = null;

    private static function getEnv(string $key, string $default): string {
        $val = getenv($key);
        if ($val !== false) return $val;
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
        return $default;
    }

    private static function getHost(): string { 
        return self::getEnv('MYSQLHOST', self::getEnv('DB_HOST', '127.0.0.1')); 
    }
    private static function getDbName(): string { 
        return self::getEnv('MYSQLDATABASE', self::getEnv('DB_NAME', 'campus_recruitment')); 
    }
    private static function getUsername(): string { 
        return self::getEnv('MYSQLUSER', self::getEnv('DB_USER', 'root')); 
    }
    private static function getPassword(): string { 
        return self::getEnv('MYSQLPASSWORD', self::getEnv('DB_PASS', '')); 
    }
    private static function getPort(): string {
        return self::getEnv('MYSQLPORT', self::getEnv('DB_PORT', '3306'));
    }
    private const CHARSET = 'utf8mb4';

    private function __construct() {}

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                self::getHost(),
                self::getPort(),
                self::getDbName(),
                self::CHARSET
            );

            try {
                self::$instance = new PDO($dsn, self::getUsername(), self::getPassword(), [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                if (defined('APP_DEBUG') && APP_DEBUG) {
                    throw new RuntimeException('Database connection failed: ' . $e->getMessage());
                }
                throw new RuntimeException('Database connection failed.');
            }
        }
        return self::$instance;
    }
}
