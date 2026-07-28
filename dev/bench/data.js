window.BENCHMARK_DATA = {
  "lastUpdate": 1785268532328,
  "repoUrl": "https://github.com/edloidas/roll-parser",
  "entries": {
    "roll-parser": [
      {
        "commit": {
          "author": {
            "email": "noreply@anthropic.com",
            "name": "Claude",
            "username": "claude"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "2340876bce40ba7cbbf15c98f893b31d3b464a8f",
          "message": "refactor: tighten public API surface #129\n\nExported `Token`, `TokenType`, and `CritThreshold`, which already leaked\nthrough `ParseError.token` and `CritThresholdNode`\nExported `lex`, `MAX_PARSE_DEPTH`, and the new `EvaluationLimits`\nDeleted the dead `evaluator/index.ts` and `rng/index.ts` barrels\nDeleted the dead `matchesCondition` re-export from `modifiers/reroll.ts`\nMade `isComparePointAhead` and `parseComparePoint` private on `Parser`\nReplaced `ResolvedThreshold` in `modifiers/success-count.ts` with the shared\n`ResolvedComparePoint`\nDocumented `createMockRng` and `MockRNGExhaustedError` on the `testing` entry\nand added its missing `RNG` and `MockRNGExhaustedError` type exports\nSimplified `roll` onto `parse` and a single `EvaluationLimits` forward\nRecomposed `EvaluateOptions` and `RollOptions` from `EvaluationLimits`\nMade `RollResult` readonly at the top level, along with `ModifierSpec`,\n`ComparePoint`, `ResolvedComparePoint`, and `NodeSpan` fields\nRebuilt the three parser sites that re-stamped `end` after construction\nDocumented the shared `DieResult` references between `rolls` and `parts`\nMoved the manifest version import to the top of `index.ts` and documented\n`VERSION`\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-07-27T13:33:11+03:00",
          "tree_id": "670dd074dee23d5225141d1ffaeaed55747a263b",
          "url": "https://github.com/edloidas/roll-parser/commit/2340876bce40ba7cbbf15c98f893b31d3b464a8f"
        },
        "date": 1785148546630,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 252.2,
            "range": "± 2.87 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=252.2ns p75=255.07ns"
          },
          {
            "name": "lex / 1d20+5",
            "value": 371.2,
            "range": "± 2.77 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=371.2ns p75=373.98ns"
          },
          {
            "name": "lex / 3d6",
            "value": 200.23,
            "range": "± 3.38 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=200.23ns p75=203.61ns"
          },
          {
            "name": "lex / 2d6+3",
            "value": 317.91,
            "range": "± 268.95 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=317.91ns p75=586.85ns"
          },
          {
            "name": "lex / 4dF",
            "value": 119.66,
            "range": "± 4.27 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=119.66ns p75=123.93ns"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 544.5,
            "range": "± 3.7 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=544.5ns p75=548.2ns"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 839.91,
            "range": "± 4.47 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=839.91ns p75=844.38ns"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 579.11,
            "range": "± 3.36 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=579.11ns p75=582.47ns"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 412.55,
            "range": "± 1.84 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=412.55ns p75=414.39ns"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 955.94,
            "range": "± 7.71 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=955.94ns p75=963.65ns"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 449.98,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=449.98ns p75=452.35ns"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 603.75,
            "range": "± 2.99 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=603.75ns p75=606.74ns"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 1364.79,
            "range": "± 9.16 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=1364.79ns p75=1373.95ns"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1833.98,
            "range": "± 11.12 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1833.98ns p75=1845.1ns"
          },
          {
            "name": "lex / 100d6",
            "value": 272.98,
            "range": "± 1.42 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=272.98ns p75=274.41ns"
          },
          {
            "name": "lex / 1000d6",
            "value": 288.89,
            "range": "± 2.45 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=288.89ns p75=291.33ns"
          },
          {
            "name": "parse / 1d20",
            "value": 508.01,
            "range": "± 2.84 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=508.01ns p75=510.85ns"
          },
          {
            "name": "parse / 1d20+5",
            "value": 761.6,
            "range": "± 4.61 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=761.6ns p75=766.21ns"
          },
          {
            "name": "parse / 3d6",
            "value": 351.52,
            "range": "± 3.61 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=351.52ns p75=355.13ns"
          },
          {
            "name": "parse / 2d6+3",
            "value": 571.7,
            "range": "± 2.42 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=571.7ns p75=574.12ns"
          },
          {
            "name": "parse / 4dF",
            "value": 208.58,
            "range": "± 2.19 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=208.58ns p75=210.77ns"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 946.78,
            "range": "± 6.29 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=946.78ns p75=953.08ns"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 1425.36,
            "range": "± 12.35 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=1425.36ns p75=1437.71ns"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 1098.16,
            "range": "± 16.62 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=1098.16ns p75=1114.78ns"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 755.2,
            "range": "± 3.27 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=755.2ns p75=758.47ns"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1744.86,
            "range": "± 13.74 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1744.86ns p75=1758.6ns"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 849.99,
            "range": "± 4.72 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=849.99ns p75=854.72ns"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 1111.6,
            "range": "± 17.38 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=1111.6ns p75=1128.98ns"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 2473.42,
            "range": "± 13.31 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=2473.42ns p75=2486.73ns"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 3892.55,
            "range": "± 23.31 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=3892.55ns p75=3915.86ns"
          },
          {
            "name": "parse / 100d6",
            "value": 516.93,
            "range": "± 2.89 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=516.93ns p75=519.82ns"
          },
          {
            "name": "parse / 1000d6",
            "value": 538.29,
            "range": "± 4.55 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=538.29ns p75=542.85ns"
          },
          {
            "name": "evaluate / 1d20",
            "value": 1137.18,
            "range": "± 15.3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=1137.18ns p75=1152.48ns"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1574.42,
            "range": "± 13.48 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1574.42ns p75=1587.9ns"
          },
          {
            "name": "evaluate / 3d6",
            "value": 1497.74,
            "range": "± 11.97 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=1497.74ns p75=1509.71ns"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1799.74,
            "range": "± 12.83 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1799.74ns p75=1812.58ns"
          },
          {
            "name": "evaluate / 4dF",
            "value": 1524.4,
            "range": "± 11.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=1524.4ns p75=1536.17ns"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 30537,
            "range": "± 4008 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=30537ns p75=34545ns"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 3930.71,
            "range": "± 57.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=3930.71ns p75=3988.39ns"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 4834.62,
            "range": "± 85.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=4834.62ns p75=4920.56ns"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2949.33,
            "range": "± 30.52 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2949.33ns p75=2979.85ns"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 3135.61,
            "range": "± 26.3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=3135.61ns p75=3161.91ns"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1763.91,
            "range": "± 20.72 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1763.91ns p75=1784.63ns"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 59522,
            "range": "± 10900 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=59522ns p75=70422ns"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 9821.77,
            "range": "± 113.91 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=9821.77ns p75=9935.68ns"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7257.27,
            "range": "± 39.31 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7257.27ns p75=7296.59ns"
          },
          {
            "name": "evaluate / 100d6",
            "value": 20833.9,
            "range": "± 72.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=20833.9ns p75=20905.99ns"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 217929,
            "range": "± 18965 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=217929ns p75=236894ns"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 1298.04,
            "range": "± 13.37 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=1298.04ns p75=1311.41ns"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 3510.93,
            "range": "± 28.52 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=3510.93ns p75=3539.45ns"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 21241.45,
            "range": "± 4.42 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=21241.45ns p75=21245.87ns"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 218710,
            "range": "± 7003 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=218710ns p75=225713ns"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 2603.13,
            "range": "± 37 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=2603.13ns p75=2640.13ns"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 9869.52,
            "range": "± 101.18 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=9869.52ns p75=9970.7ns"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 107001,
            "range": "± 781 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=107001ns p75=107782ns"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 814837,
            "range": "± 10681 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=814837ns p75=825518ns"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 2121.29,
            "range": "± 22.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=2121.29ns p75=2143.42ns"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 2819.52,
            "range": "± 33.34 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=2819.52ns p75=2852.86ns"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 2516.62,
            "range": "± 24.05 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=2516.62ns p75=2540.66ns"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 3011.91,
            "range": "± 18.47 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=3011.91ns p75=3030.38ns"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 2262.52,
            "range": "± 16.56 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=2262.52ns p75=2279.08ns"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 6413.56,
            "range": "± 60.95 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=6413.56ns p75=6474.51ns"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 6376.67,
            "range": "± 52.61 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=6376.67ns p75=6429.29ns"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 7036.31,
            "range": "± 50.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=7036.31ns p75=7086.44ns"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 4796.57,
            "range": "± 32.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=4796.57ns p75=4828.92ns"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 5583.39,
            "range": "± 35.16 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=5583.39ns p75=5618.55ns"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 3080.65,
            "range": "± 32.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=3080.65ns p75=3112.76ns"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 15850.48,
            "range": "± 76.62 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=15850.48ns p75=15927.1ns"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 13553.39,
            "range": "± 115.22 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=13553.39ns p75=13668.61ns"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 12010.93,
            "range": "± 75.03 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=12010.93ns p75=12085.96ns"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 22082.73,
            "range": "± 70.73 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=22082.73ns p75=22153.46ns"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 223510,
            "range": "± 4968 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=223510ns p75=228478ns"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1927.25,
            "range": "± 26.67 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1927.25ns p75=1953.92ns"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 2685.57,
            "range": "± 23.27 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=2685.57ns p75=2708.84ns"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 2365.15,
            "range": "± 26.09 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=2365.15ns p75=2391.25ns"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 2914.39,
            "range": "± 18.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=2914.39ns p75=2932.67ns"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 2111.39,
            "range": "± 31.22 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=2111.39ns p75=2142.61ns"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 6418.91,
            "range": "± 53.19 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=6418.91ns p75=6472.1ns"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 6452.43,
            "range": "± 94.12 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=6452.43ns p75=6546.55ns"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 7512.33,
            "range": "± 62.27 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=7512.33ns p75=7574.6ns"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 5498.36,
            "range": "± 29.99 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=5498.36ns p75=5528.35ns"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2995.22,
            "range": "± 24.55 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2995.22ns p75=3019.77ns"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 11871.47,
            "range": "± 39.45 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=11871.47ns p75=11910.93ns"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 23115.35,
            "range": "± 95.07 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=23115.35ns p75=23210.42ns"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 223339,
            "range": "± 4158 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=223339ns p75=227497ns"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "noreply@anthropic.com",
            "name": "Claude",
            "username": "claude"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "aeedc461d36d58b75e1d44b3280db5f8e06855f6",
          "message": "ci: harden workflows and deduplicate release checks #126\n\nPinned every action in `ci`, `release`, and `deploy-site` to a commit SHA\nAdded `.github/dependabot.yml` for weekly `github-actions` bumps\nAdded `.bun-version` (1.3.11) as the single Bun pin, read via `bun-version-file`\nDropped the explicit `release:dry` step, leaving `prepublishOnly` as the one gate\nSplit `release.yml` into `publish` and `release` jobs with least-privilege scopes\nExtended `check-changelog.ts` with `--extract`, replacing the awk parser in YAML\nDocumented the CI test job's hidden `build:cli` dependency\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-07-28T22:52:55+03:00",
          "tree_id": "11ff7120a834a6f0ca5a24594f165a01fe7e3fb2",
          "url": "https://github.com/edloidas/roll-parser/commit/aeedc461d36d58b75e1d44b3280db5f8e06855f6"
        },
        "date": 1785268531175,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 128.97,
            "range": "± 7.06 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=128.97ns p75=136.04ns"
          },
          {
            "name": "lex / 1d20+5",
            "value": 199.59,
            "range": "± 23.9 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=199.59ns p75=223.49ns"
          },
          {
            "name": "lex / 3d6",
            "value": 104.65,
            "range": "± 1.7 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=104.65ns p75=106.34ns"
          },
          {
            "name": "lex / 2d6+3",
            "value": 174.17,
            "range": "± 1.22 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=174.17ns p75=175.38ns"
          },
          {
            "name": "lex / 4dF",
            "value": 68.78,
            "range": "± 4.91 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=68.78ns p75=73.69ns"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 225.03,
            "range": "± 0.82 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=225.03ns p75=225.85ns"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 364.83,
            "range": "± 2.98 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=364.83ns p75=367.81ns"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 283.54,
            "range": "± 2.52 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=283.54ns p75=286.06ns"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 214.26,
            "range": "± 2.8 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=214.26ns p75=217.07ns"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 537.53,
            "range": "± 3.56 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=537.53ns p75=541.09ns"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 222.97,
            "range": "± 0.85 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=222.97ns p75=223.81ns"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 275.59,
            "range": "± 1.63 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=275.59ns p75=277.23ns"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 565.1,
            "range": "± 2.89 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=565.1ns p75=567.98ns"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1171.84,
            "range": "± 5.14 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1171.84ns p75=1176.98ns"
          },
          {
            "name": "lex / 100d6",
            "value": 140.47,
            "range": "± 0.84 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=140.47ns p75=141.31ns"
          },
          {
            "name": "lex / 1000d6",
            "value": 143.17,
            "range": "± 1.99 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=143.17ns p75=145.16ns"
          },
          {
            "name": "parse / 1d20",
            "value": 283.79,
            "range": "± 2.6 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=283.79ns p75=286.38ns"
          },
          {
            "name": "parse / 1d20+5",
            "value": 485.73,
            "range": "± 1.65 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=485.73ns p75=487.38ns"
          },
          {
            "name": "parse / 3d6",
            "value": 236.88,
            "range": "± 0.86 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=236.88ns p75=237.74ns"
          },
          {
            "name": "parse / 2d6+3",
            "value": 424.16,
            "range": "± 0.94 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=424.16ns p75=425.1ns"
          },
          {
            "name": "parse / 4dF",
            "value": 155.54,
            "range": "± 0.76 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=155.54ns p75=156.3ns"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 509.81,
            "range": "± 2.22 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=509.81ns p75=512.03ns"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 802.07,
            "range": "± 3.31 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=802.07ns p75=805.38ns"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 675.06,
            "range": "± 2.7 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=675.06ns p75=677.75ns"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 520.7,
            "range": "± 2.63 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=520.7ns p75=523.33ns"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1160.85,
            "range": "± 3.07 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1160.85ns p75=1163.92ns"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 541.15,
            "range": "± 2.44 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=541.15ns p75=543.59ns"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 666.71,
            "range": "± 1.93 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=666.71ns p75=668.64ns"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1423.78,
            "range": "± 3.45 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1423.78ns p75=1427.23ns"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2815,
            "range": "± 10.24 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2815ns p75=2825.25ns"
          },
          {
            "name": "parse / 100d6",
            "value": 311.62,
            "range": "± 2.68 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=311.62ns p75=314.3ns"
          },
          {
            "name": "parse / 1000d6",
            "value": 314.37,
            "range": "± 2.63 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=314.37ns p75=317ns"
          },
          {
            "name": "evaluate / 1d20",
            "value": 663.06,
            "range": "± 4.36 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=663.06ns p75=667.42ns"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1061.62,
            "range": "± 5.63 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1061.62ns p75=1067.25ns"
          },
          {
            "name": "evaluate / 3d6",
            "value": 823.67,
            "range": "± 2.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=823.67ns p75=826.44ns"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1165.15,
            "range": "± 2.05 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1165.15ns p75=1167.2ns"
          },
          {
            "name": "evaluate / 4dF",
            "value": 874.39,
            "range": "± 3.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=874.39ns p75=877.48ns"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 24285,
            "range": "± 3136 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=24285ns p75=27421ns"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2309.88,
            "range": "± 14.36 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2309.88ns p75=2324.24ns"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3348.54,
            "range": "± 22.62 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3348.54ns p75=3371.16ns"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2129.95,
            "range": "± 23.79 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2129.95ns p75=2153.75ns"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2608.48,
            "range": "± 30.16 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2608.48ns p75=2638.64ns"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1147.95,
            "range": "± 9.54 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1147.95ns p75=1157.49ns"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 35106,
            "range": "± 1272 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=35106ns p75=36378ns"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5860.97,
            "range": "± 66.33 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5860.97ns p75=5927.3ns"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 6953.12,
            "range": "± 24.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=6953.12ns p75=6977.3ns"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8626.62,
            "range": "± 56.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8626.62ns p75=8683.05ns"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 108242,
            "range": "± 731 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=108242ns p75=108973ns"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 679.58,
            "range": "± 2.19 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=679.58ns p75=681.77ns"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1528.61,
            "range": "± 4.86 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1528.61ns p75=1533.46ns"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8663.57,
            "range": "± 42.56 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8663.57ns p75=8706.13ns"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 107711,
            "range": "± 642 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=107711ns p75=108353ns"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1312.46,
            "range": "± 6.19 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1312.46ns p75=1318.65ns"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4144.62,
            "range": "± 38.57 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4144.62ns p75=4183.19ns"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 30881.5,
            "range": "± 237.97 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=30881.5ns p75=31119.47ns"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 408031,
            "range": "± 26520 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=408031ns p75=434551ns"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1230.93,
            "range": "± 35.29 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1230.93ns p75=1266.22ns"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1832.86,
            "range": "± 11.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1832.86ns p75=1844.73ns"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1342.21,
            "range": "± 6.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1342.21ns p75=1348.88ns"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1865.12,
            "range": "± 12.82 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1865.12ns p75=1877.95ns"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1251.27,
            "range": "± 5.47 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1251.27ns p75=1256.74ns"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3050.98,
            "range": "± 44.4 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3050.98ns p75=3095.38ns"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3569.26,
            "range": "± 19.36 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3569.26ns p75=3588.62ns"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4455.08,
            "range": "± 19.27 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4455.08ns p75=4474.35ns"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3014.37,
            "range": "± 32.85 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3014.37ns p75=3047.22ns"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4105.07,
            "range": "± 44.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4105.07ns p75=4149.42ns"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2075.41,
            "range": "± 29.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2075.41ns p75=2105.2ns"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8013.19,
            "range": "± 35.27 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8013.19ns p75=8048.46ns"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8289.74,
            "range": "± 103.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8289.74ns p75=8392.85ns"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10337.68,
            "range": "± 18.25 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10337.68ns p75=10355.93ns"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9289.45,
            "range": "± 38.18 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9289.45ns p75=9327.62ns"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 111488,
            "range": "± 772 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=111488ns p75=112260ns"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1073.54,
            "range": "± 8.26 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1073.54ns p75=1081.8ns"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1684.49,
            "range": "± 12.85 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1684.49ns p75=1697.34ns"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1215.9,
            "range": "± 10.61 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1215.9ns p75=1226.51ns"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1730.47,
            "range": "± 20.04 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1730.47ns p75=1750.51ns"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1143.9,
            "range": "± 6.64 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1143.9ns p75=1150.54ns"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2961.8,
            "range": "± 13.65 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2961.8ns p75=2975.45ns"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3528.13,
            "range": "± 34.87 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3528.13ns p75=3563ns"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4744.34,
            "range": "± 63.17 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4744.34ns p75=4807.51ns"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3973.79,
            "range": "± 53.04 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3973.79ns p75=4026.83ns"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1868.58,
            "range": "± 19.75 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1868.58ns p75=1888.33ns"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10244.3,
            "range": "± 58.7 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10244.3ns p75=10303ns"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10298.31,
            "range": "± 39.69 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10298.31ns p75=10337.99ns"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 110296,
            "range": "± 781 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=110296ns p75=111077ns"
          }
        ]
      }
    ]
  }
}