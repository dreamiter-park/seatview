<#
  색이 칠해진 "완성형" 구역 배치도 SVG -> 앱(야구장 LAB)용 SVG 로 변환

  왜: 앱은 구역 id "section-<코드>" 요소를 눌림 영역으로 쓰면서 일부러 투명하게 칠한다
      (고척처럼 "배경 그림 + 투명 눌림 영역" 구조를 전제로 함). 구역 자체에 색·번호 글자가
      들어 있는 완성형 SVG(예: 수원 KT위즈파크)를 그대로 넣으면 등록된 구역은 흰 반투명으로
      덮이고, DB에 없는 구역은 번호까지 통째로 사라진다.
  그래서:
      · 원래 구역 그룹 <g id="section-XXX"> 는 id 를 떼고(data-art 로 표시) 그림으로만 남긴다
        — 색·입체 조각·번호 글자가 항상 그대로 보인다. 툴팁(<title>)·손가락 커서도 뗀다.
      · 같은 모양의 폴리곤만 복사해 맨 위에 <g id="section-XXX"> 투명 눌림 영역으로 올린다.
        (DB 에 있는 구역만 앱이 눌리게 만들고, 나머지는 앱 CSS 가 완전히 투명하게 둔다.)

  사용:  powershell -File docs/tools/make_overlay_stadium_svg.ps1 -Source <원본.svg> -Out stadiums/suwon.svg
  ※ 특수 구역(zone-...)을 나중에 받으려면 원본에서 그 그룹 id 를 "section-<DB코드>" 로 바꾼 뒤 다시 실행.
#>
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Out
)
$ErrorActionPreference = 'Stop'
$text = [IO.File]::ReadAllText((Resolve-Path $Source).Path, [Text.Encoding]::UTF8)
if ($text -match 'data-art="') { throw "이미 변환된 파일 같아요(data-art 있음). 원본 SVG 를 넣어 주세요: $Source" }

$groupRe = [regex]::new('<g id="section-(?<code>[^"]+)"[^>]*>(?<body>.*?)</g>', 'Singleline')
$polyRe = [regex]::new('<polygon\b[^>]*?\bpoints="(?<pts>[^"]+)"[^>]*/?>')
$overlay = New-Object System.Text.StringBuilder
$count = 0

$converted = $groupRe.Replace($text, {
  param($m)
  $code = $m.Groups['code'].Value
  $body = $m.Groups['body'].Value
  if ($body -match '<g[\s>]') { throw "section-$code 안에 그룹(<g>)이 또 있어요 — 이 도구가 가정한 구조가 아닙니다." }
  $polys = $polyRe.Matches($body)
  if ($polys.Count -eq 0) { throw "section-$code 에 폴리곤이 없어요." }
  [void]$overlay.Append("<g id=""section-$code"">")
  foreach ($p in $polys) { [void]$overlay.Append("<polygon points=""$($p.Groups['pts'].Value)""/>") }
  [void]$overlay.Append('</g>')
  $script:count++
  $art = [regex]::Replace($body, '<title>.*?</title>', '', 'Singleline')
  return "<g data-art=""$code"">$art</g>"
})

# 아직 연결하지 않은 특수 구역(zone-...)에도 손가락 커서가 붙어 있어 눌리는 것처럼 보이므로 뗀다.
$converted = $converted.Replace(' style="cursor:pointer"', '')
$closeIdx = $converted.LastIndexOf('</svg>')
if ($closeIdx -lt 0) { throw "</svg> 를 찾지 못했어요." }
# 묶음 그룹 id 를 "section-" 으로 시작하게 지으면 앱이 그것까지 구역으로 읽으므로 다른 이름을 쓴다.
$result = $converted.Substring(0, $closeIdx) + "<g id=""hit-layer"">" + $overlay.ToString() + '</g>' + $converted.Substring($closeIdx)
[IO.File]::WriteAllText($Out, $result, (New-Object Text.UTF8Encoding($false)))
"{0}개 구역 변환 -> {1} ({2:N0} KB)" -f $count, $Out, ((Get-Item $Out).Length / 1KB)
