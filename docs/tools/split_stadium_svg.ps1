<#
  야구장 배치도 SVG 최적화 (피그마에서 내보낸 SVG 한 개 -> 가벼운 SVG + 배경 이미지 파일)

  왜: 피그마 SVG는 배경 그림(JPG)이 base64 글자로 통째로 들어 있어 파일이 크고(약 380KB),
      폴리곤만 고쳐도 매번 통째로 다시 받아야 한다. 배경 그림을 별도 파일로 빼면
        · SVG 는 수십 KB 로 줄고(폴리곤만 고쳐도 가볍게 갱신)
        · 배경 그림은 파일명에 내용 해시(?v=)를 붙여 브라우저가 1년간 재사용(netlify.toml 헤더)한다.
      -> 접속자당 전송량(= 우리 대역폭/캐시 용량)이 크게 줄어든다.

  사용:  powershell -File docs/tools/split_stadium_svg.ps1 -Source stadiums/gocheok1.svg
  결과:  stadiums/gocheok1.map.svg  (가벼운 SVG, 서비스에서 사용)
         stadiums/gocheok1-bg.jpg   (배경 그림, 원본 화질 그대로)
  ※ 원본 SVG(gocheok1.svg)는 그대로 둔다(로컬 개발에서는 원본을 바로 읽는다).
  ※ 폴리곤을 고쳐 새 SVG 를 올릴 때마다 이 스크립트를 다시 실행해야 서비스에 반영된다.
#>
param([Parameter(Mandatory = $true)][string]$Source)
$ErrorActionPreference = 'Stop'
$src = (Resolve-Path $Source).Path
$dir = Split-Path -Parent $src
$base = [IO.Path]::GetFileNameWithoutExtension($src)
$text = [IO.File]::ReadAllText($src, [Text.Encoding]::UTF8)

$m = [regex]::Match($text, 'xlink:href="data:image/(?<type>jpeg|png|webp);base64,(?<b64>[A-Za-z0-9+/=\s]+)"')
if (-not $m.Success) { throw "SVG 안에서 base64 이미지를 찾지 못했어요: $Source" }
$ext = switch ($m.Groups['type'].Value) { 'jpeg' { 'jpg' } default { $m.Groups['type'].Value } }
$bytes = [Convert]::FromBase64String(($m.Groups['b64'].Value -replace '\s', ''))
$sha = [Security.Cryptography.SHA1]::Create()
$hash = (($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join '').Substring(0, 8)

$imgName = "$base-bg.$ext"
[IO.File]::WriteAllBytes((Join-Path $dir $imgName), $bytes)
$newHref = "xlink:href=""/stadiums/${imgName}?v=$hash"""
$out = $text.Substring(0, $m.Index) + $newHref + $text.Substring($m.Index + $m.Length)
$mapName = "$base.map.svg"
[IO.File]::WriteAllText((Join-Path $dir $mapName), $out, (New-Object Text.UTF8Encoding($false)))

"{0}: {1:N0} KB -> {2}: {3:N0} KB + {4}: {5:N0} KB" -f (Split-Path -Leaf $src), ((Get-Item $src).Length / 1KB), $mapName, ((Get-Item (Join-Path $dir $mapName)).Length / 1KB), $imgName, ($bytes.Length / 1KB)
