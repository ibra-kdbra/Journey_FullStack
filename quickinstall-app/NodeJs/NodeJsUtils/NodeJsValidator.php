<?php

namespace Hestia\WebApp\Installers\NodeJs\NodeJsUtils;

/**
 * Strict allowlist validation for the user supplied NodeJs app options.
 * These values end up in a pm2 ecosystem file (JavaScript), an nginx config
 * included by the root managed nginx, a .env file and a '|' delimited config
 * line, so anything outside the allowlist is rejected rather than escaped.
 */
class NodeJsValidator {

	public const MIN_PORT = 1024;
	public const MAX_PORT = 65535;

	// letters, digits, space and  _ . / - : @ =   (no quotes, ; | & $ ` \ < > newlines ...)
	private const START_SCRIPT_PATTERN = '/\A[A-Za-z0-9_.\/:@= -]{1,200}\z/';
	private const NODE_VERSION_PATTERN = '/\Av[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\z/';

	public static function validatePort($port): int {
		$port = is_string($port) ? trim($port) : $port;
		if (is_int($port)) {
			$port = (string) $port;
		}
		if (!is_string($port) || !preg_match('/\A[0-9]{1,5}\z/', $port)) {
			throw new \InvalidArgumentException('Port must be a number between ' . self::MIN_PORT . ' and ' . self::MAX_PORT . '.');
		}
		$value = (int) $port;
		if ($value < self::MIN_PORT || $value > self::MAX_PORT) {
			throw new \InvalidArgumentException('Port must be a number between ' . self::MIN_PORT . ' and ' . self::MAX_PORT . '.');
		}
		return $value;
	}

	public static function validateStartScript($script): string {
		$script = is_string($script) ? trim($script) : $script;
		if (!is_string($script) || !preg_match(self::START_SCRIPT_PATTERN, $script)) {
			throw new \InvalidArgumentException('Start script may only contain letters, digits, spaces and the characters _ . / : @ = - (max 200).');
		}
		if (strpos($script, '..') !== false || $script[0] === '-' || $script[0] === '/') {
			throw new \InvalidArgumentException('Start script must be a relative command without ".." and not start with "-".');
		}
		return $script;
	}

	public static function validateNodeVersion($version): string {
		$version = is_string($version) ? trim($version) : $version;
		if (!is_string($version) || !preg_match(self::NODE_VERSION_PATTERN, $version)) {
			throw new \InvalidArgumentException('Node version must look like v20.10.0.');
		}
		return $version;
	}

	/**
	 * Returns the options with port, start_script and node_version validated
	 * and normalised. Throws \InvalidArgumentException on any invalid value.
	 */
	public static function validateOptions(?array $options): array {
		$options = $options ?? [];
		$options['port'] = (string) self::validatePort($options['port'] ?? null);
		$options['start_script'] = self::validateStartScript($options['start_script'] ?? null);
		$options['node_version'] = self::validateNodeVersion($options['node_version'] ?? null);
		return $options;
	}
}
