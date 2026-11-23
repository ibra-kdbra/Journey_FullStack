<?php
// Dependency free tests. Run with:  php quickinstall-app/NodeJs/tests/NodeJsValidatorTest.php

require __DIR__ . '/../NodeJsUtils/NodeJsValidator.php';

use Hestia\WebApp\Installers\NodeJs\NodeJsUtils\NodeJsValidator as V;

$failures = 0;
$total = 0;

function check(string $name, bool $ok): void {
	global $failures, $total;
	$total++;
	if (!$ok) {
		$failures++;
		echo "FAIL: $name\n";
	}
}

function rejects(callable $fn): bool {
	try {
		$fn();
	} catch (\InvalidArgumentException $e) {
		return true;
	}
	return false;
}

// ports
foreach (['3000', ' 8080 ', '1024', '65535', 3000] as $p) {
	check("accepts port " . var_export($p, true), V::validatePort($p) === (int) trim((string) $p));
}
foreach (['', 'abc', '80', '1023', '65536', '99999', '000000', '3000;', "3000\nlocation /x {}", '3000 ; return 200', '-1', '30.5', '0x1f90', null, [], '3000|1'] as $p) {
	check("rejects port " . json_encode($p), rejects(fn() => V::validatePort($p)));
}

// start scripts
foreach (['npm run start', 'node server.js', 'node ./dist/index.js', 'npm start', 'yarn run start:prod', 'node --max-old-space-size=512 app.js'] as $s) {
	check("accepts script '$s'", V::validateStartScript($s) === $s);
}
foreach ([
	"npm start'", "x'\n}]};require('child_process').exec('id');//", 'npm start; id', 'npm start | tee', 'npm start && id',
	'`id`', '$(id)', 'a"b', "a\nb", "a\\b", '../../etc/passwd', '/bin/sh', '-rf', '', '   ', str_repeat('a', 201), 'a<b', 'a>b', null, [],
] as $s) {
	check("rejects script " . json_encode($s), rejects(fn() => V::validateStartScript($s)));
}

// node version
check('accepts v20.10.0', V::validateNodeVersion('v20.10.0') === 'v20.10.0');
foreach (['20.10.0', "v20.10.0\n|PORT=1", 'latest', 'v20.10.0; id', ''] as $v) {
	check("rejects node version " . json_encode($v), rejects(fn() => V::validateNodeVersion($v)));
}

// whole options
$ok = V::validateOptions(['port' => ' 3000 ', 'start_script' => ' npm run start ', 'node_version' => 'v18.18.2']);
check('validateOptions normalises', $ok === ['port' => '3000', 'start_script' => 'npm run start', 'node_version' => 'v18.18.2']);
check('validateOptions rejects missing', rejects(fn() => V::validateOptions(null)));
check('validateOptions rejects bad port', rejects(fn() => V::validateOptions(['port' => "3000;\n", 'start_script' => 'npm start', 'node_version' => 'v18.18.2'])));

echo ($total - $failures) . "/$total passed\n";
exit($failures ? 1 : 0);
