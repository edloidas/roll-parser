window.BENCHMARK_DATA = {
  "lastUpdate": 1785702303055,
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
          "id": "bd7f82065298a0a669ba2e5525215e3db5d5ea8a",
          "message": "fix: stabilize evaluate bench group and variable-work cases #143\n\nTraced the multi-modal p50s to mitata's sampling-mode heuristic, which commits\nfrom three cold calls of the bench body against a 65,536 ns cutoff\nAdded `primeBenchFn`, which tiers a bench body up and swallows those three\ncalls so every case is batch-sampled on every machine\nMoved all four stage benches to the generator form, the only hook that runs\nbefore mitata's warm-up\nRecorded the sampling mode in the `bench:json` `extra` field as a tripwire\nNoted the priming and batch pinning in the README performance protocol, and\nrestated the 1000-die figure that the old single-call mode inflated\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-07-29T14:53:20+03:00",
          "tree_id": "a16ab70f1f7951d1e00734f41f974bfc860fcef3",
          "url": "https://github.com/edloidas/roll-parser/commit/bd7f82065298a0a669ba2e5525215e3db5d5ea8a"
        },
        "date": 1785326188818,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 142.06,
            "range": "± 1.04 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=142.06ns p75=143.1ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 185.74,
            "range": "± 1.72 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=185.74ns p75=187.46ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 118.65,
            "range": "± 2.7 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=118.65ns p75=121.35ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 167.39,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=167.39ns p75=169.75ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 70.21,
            "range": "± 3.7 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=70.21ns p75=73.91ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 198.85,
            "range": "± 1.9 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=198.85ns p75=200.75ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 334.89,
            "range": "± 2.85 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=334.89ns p75=337.74ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 260.14,
            "range": "± 1.19 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=260.14ns p75=261.32ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 190.36,
            "range": "± 0.9 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=190.36ns p75=191.26ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 507.23,
            "range": "± 2.89 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=507.23ns p75=510.12ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 204.8,
            "range": "± 1.44 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=204.8ns p75=206.24ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 242.71,
            "range": "± 1.63 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=242.71ns p75=244.33ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 550.29,
            "range": "± 2.71 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=550.29ns p75=553.01ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1176.98,
            "range": "± 7.26 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1176.98ns p75=1184.24ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 129.6,
            "range": "± 1.65 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=129.6ns p75=131.25ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 131.38,
            "range": "± 1.31 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=131.38ns p75=132.69ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 269.07,
            "range": "± 1.63 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=269.07ns p75=270.7ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 386.34,
            "range": "± 1.36 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=386.34ns p75=387.7ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 233.05,
            "range": "± 0.98 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=233.05ns p75=234.03ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 355.21,
            "range": "± 2.24 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=355.21ns p75=357.46ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 148.26,
            "range": "± 1.56 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=148.26ns p75=149.82ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 428.44,
            "range": "± 1.95 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=428.44ns p75=430.39ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 703.4,
            "range": "± 4.32 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=703.4ns p75=707.71ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 550.54,
            "range": "± 4.32 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=550.54ns p75=554.86ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 420.68,
            "range": "± 1.89 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=420.68ns p75=422.57ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1101.99,
            "range": "± 7.1 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1101.99ns p75=1109.09ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 412.11,
            "range": "± 2.84 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=412.11ns p75=414.95ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 537.51,
            "range": "± 4.87 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=537.51ns p75=542.38ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1321.88,
            "range": "± 5.3 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1321.88ns p75=1327.18ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2817.8,
            "range": "± 7.85 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2817.8ns p75=2825.64ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 265.34,
            "range": "± 1.43 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=265.34ns p75=266.77ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 268.69,
            "range": "± 1.43 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=268.69ns p75=270.12ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 625.76,
            "range": "± 5.22 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=625.76ns p75=630.98ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1112.23,
            "range": "± 10.26 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1112.23ns p75=1122.49ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 805.08,
            "range": "± 7.86 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=805.08ns p75=812.94ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1217.49,
            "range": "± 13.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1217.49ns p75=1230.58ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 852.37,
            "range": "± 3.5 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=852.37ns p75=855.87ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2287.64,
            "range": "± 30.73 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2287.64ns p75=2318.37ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2644.07,
            "range": "± 21.73 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2644.07ns p75=2665.8ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3433.88,
            "range": "± 25.41 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3433.88ns p75=3459.29ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2285.43,
            "range": "± 12.85 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2285.43ns p75=2298.27ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2939.31,
            "range": "± 20.11 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2939.31ns p75=2959.42ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1255.65,
            "range": "± 11.53 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1255.65ns p75=1267.18ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7213.54,
            "range": "± 49.54 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7213.54ns p75=7263.08ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6465.36,
            "range": "± 65.38 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6465.36ns p75=6530.74ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 8269.44,
            "range": "± 46.67 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=8269.44ns p75=8316.12ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 9235.47,
            "range": "± 88.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=9235.47ns p75=9324.24ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 86128.36,
            "range": "± 232.2 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=86128.36ns p75=86360.56ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 674.04,
            "range": "± 5.32 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=674.04ns p75=679.35ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1478.48,
            "range": "± 14.96 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1478.48ns p75=1493.43ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 9293.18,
            "range": "± 34.19 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=9293.18ns p75=9327.37ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 85153.71,
            "range": "± 546.87 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=85153.71ns p75=85700.58ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1460.15,
            "range": "± 13.74 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1460.15ns p75=1473.9ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4543.79,
            "range": "± 21.08 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4543.79ns p75=4564.86ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 33707.41,
            "range": "± 136.98 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=33707.41ns p75=33844.39ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 401121.22,
            "range": "± 851.87 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=401121.22ns p75=401973.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1339.47,
            "range": "± 12.98 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1339.47ns p75=1352.45ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 2152.93,
            "range": "± 18.63 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=2152.93ns p75=2171.56ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1480.04,
            "range": "± 20.62 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1480.04ns p75=1500.65ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 2164.69,
            "range": "± 28.47 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=2164.69ns p75=2193.16ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1303.52,
            "range": "± 14.23 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1303.52ns p75=1317.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3245.22,
            "range": "± 19.05 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3245.22ns p75=3264.28ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3823.63,
            "range": "± 12.01 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3823.63ns p75=3835.63ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4472.76,
            "range": "± 25.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4472.76ns p75=4498.65ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3202.31,
            "range": "± 13.82 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3202.31ns p75=3216.13ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4831.1,
            "range": "± 37.89 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4831.1ns p75=4868.98ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2344.51,
            "range": "± 34.68 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2344.51ns p75=2379.19ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8516.5,
            "range": "± 62.95 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8516.5ns p75=8579.44ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8639.2,
            "range": "± 84.62 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8639.2ns p75=8723.82ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 12279.55,
            "range": "± 63.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=12279.55ns p75=12343.49ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 10179.5,
            "range": "± 102.38 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=10179.5ns p75=10281.88ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 85890.4,
            "range": "± 999.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=85890.4ns p75=86889.51ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1176.47,
            "range": "± 12.18 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1176.47ns p75=1188.65ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1898.33,
            "range": "± 13.34 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1898.33ns p75=1911.66ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1346.92,
            "range": "± 22.9 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1346.92ns p75=1369.82ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1924.62,
            "range": "± 12.74 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1924.62ns p75=1937.36ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1250.44,
            "range": "± 8.93 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1250.44ns p75=1259.37ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3300.54,
            "range": "± 23.81 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3300.54ns p75=3324.35ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3722.28,
            "range": "± 15.65 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3722.28ns p75=3737.93ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4797.78,
            "range": "± 33.91 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4797.78ns p75=4831.69ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4289.5,
            "range": "± 41 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4289.5ns p75=4330.5ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2050.56,
            "range": "± 24.99 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2050.56ns p75=2075.55ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 11708.52,
            "range": "± 110.82 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=11708.52ns p75=11819.34ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 11109.77,
            "range": "± 31.49 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=11109.77ns p75=11141.26ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 97363.42,
            "range": "± 385.18 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=97363.42ns p75=97748.6ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "3c0ffab426f6c7d8927c76db42823f8e35598f58",
          "message": "ci: upgrade actions to latest majors and group Dependabot updates #149\n\nBumped SHA pins to the latest majors: `actions/checkout` v4.4.0 to v7.0.1,\n`actions/cache` v4.3.0 to v6.1.0, `actions/upload-artifact` v4.6.2 to v7.0.1,\n`actions/download-artifact` v4.3.0 to v8.0.1, `actions/setup-node` v4.4.0 to\nv7.0.0, and `softprops/action-gh-release` v2.6.2 to v3.0.2.\nDisabled setup-node's npm auto-cache via `package-manager-cache: false` — on by\ndefault since v5 and it hard-fails without a `package-lock.json`.\nGrouped the `github-actions` ecosystem into a single weekly Dependabot PR.\nRemoved the unused `claude.yml` workflow.",
          "timestamp": "2026-07-30T15:43:54+03:00",
          "tree_id": "bb76236bf9119776b054da25573d558bf4c04b96",
          "url": "https://github.com/edloidas/roll-parser/commit/3c0ffab426f6c7d8927c76db42823f8e35598f58"
        },
        "date": 1785415636190,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 144.45,
            "range": "± 2.32 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=144.45ns p75=146.77ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 209.27,
            "range": "± 1 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=209.27ns p75=210.27ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 120.31,
            "range": "± 4.45 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=120.31ns p75=124.75ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 192.21,
            "range": "± 1.93 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=192.21ns p75=194.14ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 69.51,
            "range": "± 5.47 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=69.51ns p75=74.98ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 229.72,
            "range": "± 6.26 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=229.72ns p75=235.98ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 368.63,
            "range": "± 241.52 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=368.63ns p75=610.15ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 291.51,
            "range": "± 2.2 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=291.51ns p75=293.71ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 217.87,
            "range": "± 1.7 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=217.87ns p75=219.57ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 538.81,
            "range": "± 3.07 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=538.81ns p75=541.88ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 237.44,
            "range": "± 1.6 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=237.44ns p75=239.04ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 273.59,
            "range": "± 2.33 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=273.59ns p75=275.91ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 576.48,
            "range": "± 3.14 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=576.48ns p75=579.62ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1222.96,
            "range": "± 5.92 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1222.96ns p75=1228.88ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 129.62,
            "range": "± 1.88 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=129.62ns p75=131.49ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 131.89,
            "range": "± 1.09 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=131.89ns p75=132.97ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 271.92,
            "range": "± 1.77 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=271.92ns p75=273.68ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 422.31,
            "range": "± 4.04 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=422.31ns p75=426.35ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 231.03,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=231.03ns p75=233.4ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 386.45,
            "range": "± 2.64 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=386.45ns p75=389.1ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 147.86,
            "range": "± 1.55 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=147.86ns p75=149.4ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 448.03,
            "range": "± 1.87 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=448.03ns p75=449.91ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 726.05,
            "range": "± 3.96 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=726.05ns p75=730.01ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 603.65,
            "range": "± 4.22 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=603.65ns p75=607.87ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 456.89,
            "range": "± 1.84 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=456.89ns p75=458.72ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1147.35,
            "range": "± 6.32 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1147.35ns p75=1153.67ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 445.43,
            "range": "± 2.34 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=445.43ns p75=447.78ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 604.75,
            "range": "± 3.77 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=604.75ns p75=608.53ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1358.64,
            "range": "± 7.68 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1358.64ns p75=1366.32ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2884.68,
            "range": "± 19.99 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2884.68ns p75=2904.66ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 264.33,
            "range": "± 1.9 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=264.33ns p75=266.23ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 267.95,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=267.95ns p75=270.32ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 610.29,
            "range": "± 3.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=610.29ns p75=614.05ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1036.49,
            "range": "± 7.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1036.49ns p75=1044.43ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 818.5,
            "range": "± 6.35 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=818.5ns p75=824.85ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1175.42,
            "range": "± 9.58 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1175.42ns p75=1185ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 876.2,
            "range": "± 7.2 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=876.2ns p75=883.41ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2407.92,
            "range": "± 20.92 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2407.92ns p75=2428.84ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2587.48,
            "range": "± 20.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2587.48ns p75=2607.77ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3766.68,
            "range": "± 21.78 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3766.68ns p75=3788.46ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2348.92,
            "range": "± 13.99 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2348.92ns p75=2362.91ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2635.57,
            "range": "± 16 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2635.57ns p75=2651.57ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1175.44,
            "range": "± 8.83 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1175.44ns p75=1184.27ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7799.64,
            "range": "± 48.12 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7799.64ns p75=7847.76ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6503.68,
            "range": "± 117.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6503.68ns p75=6620.97ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7467.95,
            "range": "± 38.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7467.95ns p75=7506.72ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 10900.79,
            "range": "± 26.88 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=10900.79ns p75=10927.67ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 101492.49,
            "range": "± 258.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=101492.49ns p75=101750.58ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 641.08,
            "range": "± 4.16 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=641.08ns p75=645.25ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1660.65,
            "range": "± 12.63 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1660.65ns p75=1673.28ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 10870.36,
            "range": "± 41.22 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=10870.36ns p75=10911.58ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 101610.93,
            "range": "± 147.08 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=101610.93ns p75=101758.02ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1424.12,
            "range": "± 10.93 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1424.12ns p75=1435.05ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4921.66,
            "range": "± 22.32 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4921.66ns p75=4943.97ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 36872.99,
            "range": "± 207.72 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=36872.99ns p75=37080.71ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 431652.36,
            "range": "± 500.86 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=431652.36ns p75=432153.22ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1261.49,
            "range": "± 27.01 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1261.49ns p75=1288.49ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 2000.6,
            "range": "± 29.18 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=2000.6ns p75=2029.78ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1398.06,
            "range": "± 9.04 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1398.06ns p75=1407.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 2055.38,
            "range": "± 24.68 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=2055.38ns p75=2080.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1332.34,
            "range": "± 10.76 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1332.34ns p75=1343.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3367.47,
            "range": "± 15.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3367.47ns p75=3383.27ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3771.15,
            "range": "± 13.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3771.15ns p75=3785.02ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4820.79,
            "range": "± 21.01 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4820.79ns p75=4841.79ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3278.01,
            "range": "± 16.58 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3278.01ns p75=3294.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4336.11,
            "range": "± 15.37 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4336.11ns p75=4351.48ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2317.7,
            "range": "± 26.05 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2317.7ns p75=2343.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8897.6,
            "range": "± 23.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8897.6ns p75=8921.01ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8264.9,
            "range": "± 25.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8264.9ns p75=8290.83ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 11311.98,
            "range": "± 26.97 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=11311.98ns p75=11338.95ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 11619.03,
            "range": "± 50.71 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=11619.03ns p75=11669.74ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 102662.82,
            "range": "± 398.81 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=102662.82ns p75=103061.63ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1090.63,
            "range": "± 11.41 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1090.63ns p75=1102.04ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1863.63,
            "range": "± 12.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1863.63ns p75=1875.91ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1273.49,
            "range": "± 10.37 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1273.49ns p75=1283.86ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1916.36,
            "range": "± 32.63 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1916.36ns p75=1948.99ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1222.65,
            "range": "± 11.64 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1222.65ns p75=1234.28ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3310.52,
            "range": "± 9.78 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3310.52ns p75=3320.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3703.9,
            "range": "± 19.63 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3703.9ns p75=3723.52ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 5397.43,
            "range": "± 53.13 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=5397.43ns p75=5450.56ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4280.43,
            "range": "± 42.94 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4280.43ns p75=4323.37ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2084.03,
            "range": "± 22.4 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2084.03ns p75=2106.43ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 11265.93,
            "range": "± 20.25 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=11265.93ns p75=11286.18ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 12830.73,
            "range": "± 53.4 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=12830.73ns p75=12884.13ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 113980.55,
            "range": "± 405.08 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=113980.55ns p75=114385.63ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "a59c5df25e7554ff7fbe54b209b1dfbd8f1add82",
          "message": "docs: simplify PR attribution and release conventions\n\nRemoved the `Drafted with AI assistance` line from issue and PR templates\nMoved the session link to a single `<sub>`-wrapped line at the body end\nForbade a second generated footer or promotional line in PR bodies\nDocumented multiple issues on one `Closes` line\nDropped the `/npm-release` skill reference from the releasing section\nCondensed the pre-commit hook note\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-07-30T16:39:15+02:00",
          "tree_id": "c7ebba5313af9169257b0641befc6ad4f0af10b3",
          "url": "https://github.com/edloidas/roll-parser/commit/a59c5df25e7554ff7fbe54b209b1dfbd8f1add82"
        },
        "date": 1785422584862,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 137.71,
            "range": "± 5.22 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=137.71ns p75=142.93ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 203.44,
            "range": "± 2.14 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=203.44ns p75=205.58ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 112.48,
            "range": "± 2.7 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=112.48ns p75=115.19ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 180.52,
            "range": "± 58.76 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=180.52ns p75=239.28ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 65.9,
            "range": "± 6.02 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=65.9ns p75=71.93ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 215.55,
            "range": "± 0.68 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=215.55ns p75=216.23ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 344.63,
            "range": "± 2.22 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=344.63ns p75=346.84ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 282.06,
            "range": "± 1.14 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=282.06ns p75=283.2ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 205.47,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=205.47ns p75=207.25ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 523.06,
            "range": "± 3.3 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=523.06ns p75=526.36ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 231.77,
            "range": "± 1.72 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=231.77ns p75=233.49ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 260.61,
            "range": "± 1.66 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=260.61ns p75=262.27ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 547.68,
            "range": "± 2.75 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=547.68ns p75=550.43ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1162.28,
            "range": "± 7.18 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1162.28ns p75=1169.46ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 124.68,
            "range": "± 2.29 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=124.68ns p75=126.97ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 127.29,
            "range": "± 0.71 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=127.29ns p75=128ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 288.57,
            "range": "± 2.38 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=288.57ns p75=290.95ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 482.23,
            "range": "± 2.11 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=482.23ns p75=484.34ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 237.18,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=237.18ns p75=238.96ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 423.21,
            "range": "± 3.79 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=423.21ns p75=427ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 139.06,
            "range": "± 1.79 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=139.06ns p75=140.85ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 509.06,
            "range": "± 1.95 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=509.06ns p75=511.01ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 776.69,
            "range": "± 3.3 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=776.69ns p75=779.99ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 663.74,
            "range": "± 7.99 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=663.74ns p75=671.73ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 496.81,
            "range": "± 2.07 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=496.81ns p75=498.88ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1143.39,
            "range": "± 9.9 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1143.39ns p75=1153.29ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 513.89,
            "range": "± 2.07 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=513.89ns p75=515.95ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 657.22,
            "range": "± 2.38 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=657.22ns p75=659.6ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1403.74,
            "range": "± 4.93 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1403.74ns p75=1408.67ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2732.74,
            "range": "± 12.37 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2732.74ns p75=2745.11ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 296.71,
            "range": "± 2.04 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=296.71ns p75=298.75ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 295.99,
            "range": "± 2.57 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=295.99ns p75=298.57ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 646.41,
            "range": "± 4.63 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=646.41ns p75=651.03ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1063.47,
            "range": "± 4.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1063.47ns p75=1068.36ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 813.87,
            "range": "± 3.39 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=813.87ns p75=817.27ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1171.57,
            "range": "± 4.05 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1171.57ns p75=1175.62ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 851.12,
            "range": "± 3.64 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=851.12ns p75=854.76ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2116.56,
            "range": "± 12.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2116.56ns p75=2129.31ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2306.31,
            "range": "± 21.25 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2306.31ns p75=2327.56ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3351.3,
            "range": "± 17.83 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3351.3ns p75=3369.12ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2127.17,
            "range": "± 9.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2127.17ns p75=2136.83ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2533.87,
            "range": "± 29.07 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2533.87ns p75=2562.94ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1155.58,
            "range": "± 12.12 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1155.58ns p75=1167.69ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6991.64,
            "range": "± 51.34 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6991.64ns p75=7042.99ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6077.47,
            "range": "± 90.24 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6077.47ns p75=6167.7ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 6984.43,
            "range": "± 25.22 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=6984.43ns p75=7009.64ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8718.54,
            "range": "± 36.2 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8718.54ns p75=8754.73ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 79956.23,
            "range": "± 38.2 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=79956.23ns p75=79994.43ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 698.45,
            "range": "± 6.81 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=698.45ns p75=705.26ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1551.21,
            "range": "± 17.72 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1551.21ns p75=1568.93ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8709.35,
            "range": "± 58.6 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8709.35ns p75=8767.94ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 80366.25,
            "range": "± 293.7 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=80366.25ns p75=80659.95ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1375.84,
            "range": "± 14.68 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1375.84ns p75=1390.52ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4326.29,
            "range": "± 31.66 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4326.29ns p75=4357.95ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 32422.29,
            "range": "± 52.1 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=32422.29ns p75=32474.39ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 382878.31,
            "range": "± 1198.39 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=382878.31ns p75=384076.7ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1237.02,
            "range": "± 24.56 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1237.02ns p75=1261.57ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1891.41,
            "range": "± 21.15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1891.41ns p75=1912.56ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1389.07,
            "range": "± 29.09 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1389.07ns p75=1418.16ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1933.14,
            "range": "± 18.95 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1933.14ns p75=1952.09ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1292.82,
            "range": "± 12.72 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1292.82ns p75=1305.54ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3137.32,
            "range": "± 18.6 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3137.32ns p75=3155.92ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3611.95,
            "range": "± 17.42 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3611.95ns p75=3629.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4423.84,
            "range": "± 26.63 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4423.84ns p75=4450.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3265.68,
            "range": "± 19.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3265.68ns p75=3285.09ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4681.25,
            "range": "± 27.26 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4681.25ns p75=4708.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2145.49,
            "range": "± 32.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2145.49ns p75=2177.95ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8249.89,
            "range": "± 45.55 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8249.89ns p75=8295.44ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8368.75,
            "range": "± 112.31 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8368.75ns p75=8481.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10484.05,
            "range": "± 47.85 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10484.05ns p75=10531.89ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9411.03,
            "range": "± 14.59 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9411.03ns p75=9425.63ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 81336.8,
            "range": "± 559.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=81336.8ns p75=81896.26ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1090.91,
            "range": "± 9.82 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1090.91ns p75=1100.73ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1740.64,
            "range": "± 20.48 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1740.64ns p75=1761.12ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1248.22,
            "range": "± 12.13 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1248.22ns p75=1260.35ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1799.89,
            "range": "± 35.09 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1799.89ns p75=1834.98ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1174,
            "range": "± 10.14 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1174ns p75=1184.13ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3118.77,
            "range": "± 12.54 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3118.77ns p75=3131.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3629.77,
            "range": "± 24.65 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3629.77ns p75=3654.41ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4843.67,
            "range": "± 62.53 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4843.67ns p75=4906.2ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4242.3,
            "range": "± 54.01 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4242.3ns p75=4296.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1990.04,
            "range": "± 24.79 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1990.04ns p75=2014.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10893.01,
            "range": "± 38 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10893.01ns p75=10931.01ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10651.22,
            "range": "± 54.66 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10651.22ns p75=10705.89ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 92322.24,
            "range": "± 242.24 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=92322.24ns p75=92564.48ns mode=batch"
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
          "id": "ab3e056c6f5c3dd4b1487129004e88bd350368bb",
          "message": "ci: add stable fan-in check for the Node smoke matrix #155\n\nAdded `node-smoke-gate` reporting a fixed `Node.js Smoke Test` check name, so branch protection no longer depends on matrix-derived leg names.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-01T02:17:21+03:00",
          "tree_id": "b63c534c836b7eaed57621f0cec3f01b5e0ea6ae",
          "url": "https://github.com/edloidas/roll-parser/commit/ab3e056c6f5c3dd4b1487129004e88bd350368bb"
        },
        "date": 1785540045817,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 134.93,
            "range": "± 2.41 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=134.93ns p75=137.34ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 175.6,
            "range": "± 1.19 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=175.6ns p75=176.79ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 116.07,
            "range": "± 3.65 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=116.07ns p75=119.72ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 160.18,
            "range": "± 67.36 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=160.18ns p75=227.54ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 73.75,
            "range": "± 5.02 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=73.75ns p75=78.77ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 198.82,
            "range": "± 2.16 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=198.82ns p75=200.98ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 328.96,
            "range": "± 2.73 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=328.96ns p75=331.7ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 254.94,
            "range": "± 2.25 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=254.94ns p75=257.19ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 191.23,
            "range": "± 0.59 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=191.23ns p75=191.82ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 547.68,
            "range": "± 3.4 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=547.68ns p75=551.08ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 204.74,
            "range": "± 0.77 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=204.74ns p75=205.51ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 241.91,
            "range": "± 2.31 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=241.91ns p75=244.21ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 550.17,
            "range": "± 3.17 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=550.17ns p75=553.34ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1200.19,
            "range": "± 8.34 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1200.19ns p75=1208.53ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 134.41,
            "range": "± 1.25 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=134.41ns p75=135.66ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 139.43,
            "range": "± 1.82 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=139.43ns p75=141.25ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 301.33,
            "range": "± 2.2 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=301.33ns p75=303.54ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 446.32,
            "range": "± 2.79 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=446.32ns p75=449.11ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 252.62,
            "range": "± 2.1 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=252.62ns p75=254.72ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 389.1,
            "range": "± 1.64 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=389.1ns p75=390.74ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 147.88,
            "range": "± 2.27 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=147.88ns p75=150.15ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 447.77,
            "range": "± 3.01 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=447.77ns p75=450.78ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 744.2,
            "range": "± 4.45 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=744.2ns p75=748.66ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 644.75,
            "range": "± 2.13 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=644.75ns p75=646.88ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 462.94,
            "range": "± 2.27 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=462.94ns p75=465.22ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1170.21,
            "range": "± 9.72 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1170.21ns p75=1179.92ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 489.56,
            "range": "± 1.68 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=489.56ns p75=491.23ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 625.89,
            "range": "± 3 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=625.89ns p75=628.89ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1406.02,
            "range": "± 10.52 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1406.02ns p75=1416.54ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2888.57,
            "range": "± 16.15 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2888.57ns p75=2904.71ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 311.96,
            "range": "± 2.99 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=311.96ns p75=314.94ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 317.01,
            "range": "± 2.95 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=317.01ns p75=319.97ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 663.33,
            "range": "± 4.83 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=663.33ns p75=668.16ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1070.67,
            "range": "± 11.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1070.67ns p75=1082.24ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 827.59,
            "range": "± 4.55 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=827.59ns p75=832.14ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1173.72,
            "range": "± 7.32 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1173.72ns p75=1181.04ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 866.24,
            "range": "± 4.59 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=866.24ns p75=870.83ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2137.84,
            "range": "± 30.37 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2137.84ns p75=2168.22ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2324.44,
            "range": "± 47.53 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2324.44ns p75=2371.97ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3441.15,
            "range": "± 28.49 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3441.15ns p75=3469.65ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2164.51,
            "range": "± 27.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2164.51ns p75=2192.28ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2584.51,
            "range": "± 35.4 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2584.51ns p75=2619.91ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1181.46,
            "range": "± 16.4 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1181.46ns p75=1197.86ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7060.77,
            "range": "± 82.88 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7060.77ns p75=7143.66ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6324.94,
            "range": "± 98.32 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6324.94ns p75=6423.26ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7030.63,
            "range": "± 43.88 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7030.63ns p75=7074.51ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8791.6,
            "range": "± 21.42 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8791.6ns p75=8813.03ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 79405.22,
            "range": "± 567.63 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=79405.22ns p75=79972.85ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 709.1,
            "range": "± 4.19 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=709.1ns p75=713.29ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1562.95,
            "range": "± 8.95 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1562.95ns p75=1571.9ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8868.9,
            "range": "± 44.23 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8868.9ns p75=8913.14ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 79402.97,
            "range": "± 184.65 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=79402.97ns p75=79587.62ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1369.07,
            "range": "± 6.99 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1369.07ns p75=1376.06ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4214.16,
            "range": "± 38.13 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4214.16ns p75=4252.29ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 30000.76,
            "range": "± 67.29 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=30000.76ns p75=30068.05ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 303417.74,
            "range": "± 210.46 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=303417.74ns p75=303628.2ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1253.48,
            "range": "± 23.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1253.48ns p75=1276.61ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1836.07,
            "range": "± 20.7 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1836.07ns p75=1856.77ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1357.69,
            "range": "± 4.9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1357.69ns p75=1362.59ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1865.11,
            "range": "± 20.15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1865.11ns p75=1885.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1270.76,
            "range": "± 14.84 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1270.76ns p75=1285.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3074.64,
            "range": "± 35.71 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3074.64ns p75=3110.35ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3533.67,
            "range": "± 31.76 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3533.67ns p75=3565.44ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4372.21,
            "range": "± 24.62 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4372.21ns p75=4396.83ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3027.67,
            "range": "± 34.39 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3027.67ns p75=3062.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4143.82,
            "range": "± 24.47 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4143.82ns p75=4168.29ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2146.7,
            "range": "± 30.6 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2146.7ns p75=2177.3ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8140.8,
            "range": "± 48.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8140.8ns p75=8189.67ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8413.79,
            "range": "± 44.27 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8413.79ns p75=8458.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10626.73,
            "range": "± 98.33 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10626.73ns p75=10725.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9523.39,
            "range": "± 20.72 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9523.39ns p75=9544.11ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 79915.35,
            "range": "± 142.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=79915.35ns p75=80057.47ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1111.38,
            "range": "± 11.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1111.38ns p75=1122.66ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1709.87,
            "range": "± 13.73 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1709.87ns p75=1723.6ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1245.51,
            "range": "± 12.73 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1245.51ns p75=1258.24ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1760.4,
            "range": "± 7.11 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1760.4ns p75=1767.51ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1170.54,
            "range": "± 15.92 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1170.54ns p75=1186.46ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2925.75,
            "range": "± 55.41 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2925.75ns p75=2981.16ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3408.99,
            "range": "± 57.15 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3408.99ns p75=3466.14ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4712.32,
            "range": "± 38.84 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4712.32ns p75=4751.16ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3916.28,
            "range": "± 51.49 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3916.28ns p75=3967.77ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1894.78,
            "range": "± 28.02 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1894.78ns p75=1922.8ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10438.11,
            "range": "± 45.89 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10438.11ns p75=10484ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10503.42,
            "range": "± 63.44 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10503.42ns p75=10566.86ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 89213.87,
            "range": "± 412.67 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=89213.87ns p75=89626.55ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "81578e12f8a109712654954427eda54a4d6a9628",
          "message": "ci: update dependencies via the bun ecosystem #170\n\nSwitched the dependency block from `package-ecosystem: npm` to `bun` — the\nnpm updater rewrote `package.json` and left `bun.lock` untouched, so every\nPR it opened failed `bun install --frozen-lockfile`\nAdded a 3-day `cooldown` mirroring `minimumReleaseAge` in `bunfig.toml`, so\nDependabot cannot propose a version Bun then refuses to resolve",
          "timestamp": "2026-08-01T02:40:41+03:00",
          "tree_id": "d93da8260bd96cd78237c669a50343d7a3d94736",
          "url": "https://github.com/edloidas/roll-parser/commit/81578e12f8a109712654954427eda54a4d6a9628"
        },
        "date": 1785541439187,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 139.55,
            "range": "± 1.92 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=139.55ns p75=141.47ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 206.42,
            "range": "± 9.01 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=206.42ns p75=215.43ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 118.76,
            "range": "± 2.58 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=118.76ns p75=121.34ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 192.1,
            "range": "± 1.75 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=192.1ns p75=193.85ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 79,
            "range": "± 4.14 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=79ns p75=83.14ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 232.63,
            "range": "± 1.24 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=232.63ns p75=233.87ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 366,
            "range": "± 1.44 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=366ns p75=367.44ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 288.15,
            "range": "± 2.3 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=288.15ns p75=290.45ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 227.16,
            "range": "± 0.96 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=227.16ns p75=228.11ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 543.19,
            "range": "± 3.68 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=543.19ns p75=546.87ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 237.35,
            "range": "± 1.07 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=237.35ns p75=238.42ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 273.16,
            "range": "± 1.92 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=273.16ns p75=275.08ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 583.16,
            "range": "± 2.86 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=583.16ns p75=586.02ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1204.74,
            "range": "± 5.56 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1204.74ns p75=1210.3ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 133.83,
            "range": "± 0.8 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=133.83ns p75=134.63ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 135.49,
            "range": "± 0.96 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=135.49ns p75=136.45ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 276.86,
            "range": "± 9.41 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=276.86ns p75=286.27ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 441.44,
            "range": "± 4.64 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=441.44ns p75=446.07ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 238.82,
            "range": "± 1.61 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=238.82ns p75=240.43ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 401.48,
            "range": "± 2.63 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=401.48ns p75=404.1ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 150.56,
            "range": "± 0.85 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=150.56ns p75=151.4ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 471.55,
            "range": "± 1.85 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=471.55ns p75=473.41ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 751.5,
            "range": "± 3.76 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=751.5ns p75=755.26ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 615.76,
            "range": "± 3.34 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=615.76ns p75=619.1ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 474.81,
            "range": "± 1.73 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=474.81ns p75=476.54ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1144.14,
            "range": "± 6.65 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1144.14ns p75=1150.79ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 449.81,
            "range": "± 2 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=449.81ns p75=451.81ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 629.04,
            "range": "± 3.9 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=629.04ns p75=632.94ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1384.28,
            "range": "± 7.03 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1384.28ns p75=1391.31ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 3046.47,
            "range": "± 15.91 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=3046.47ns p75=3062.38ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 270.45,
            "range": "± 6.82 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=270.45ns p75=277.27ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 272.4,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=272.4ns p75=274.77ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 610.79,
            "range": "± 2.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=610.79ns p75=613.73ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1035.44,
            "range": "± 4.63 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1035.44ns p75=1040.07ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 789.97,
            "range": "± 2.86 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=789.97ns p75=792.83ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1142.99,
            "range": "± 2.84 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1142.99ns p75=1145.83ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 841.88,
            "range": "± 3.43 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=841.88ns p75=845.3ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2122.05,
            "range": "± 13.67 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2122.05ns p75=2135.72ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2373.04,
            "range": "± 14.95 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2373.04ns p75=2388ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3447.98,
            "range": "± 18.69 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3447.98ns p75=3466.67ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2128.21,
            "range": "± 12.8 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2128.21ns p75=2141.01ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2566.73,
            "range": "± 23.45 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2566.73ns p75=2590.18ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1133.91,
            "range": "± 4.54 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1133.91ns p75=1138.45ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6829.65,
            "range": "± 35.7 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6829.65ns p75=6865.35ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6119.52,
            "range": "± 40.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6119.52ns p75=6160.29ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7083.73,
            "range": "± 43.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7083.73ns p75=7127.01ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8914.26,
            "range": "± 39.84 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8914.26ns p75=8954.1ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 81068.52,
            "range": "± 225.14 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=81068.52ns p75=81293.66ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 662.45,
            "range": "± 2.92 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=662.45ns p75=665.37ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1478.86,
            "range": "± 6.23 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1478.86ns p75=1485.09ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 9015.25,
            "range": "± 24.93 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=9015.25ns p75=9040.18ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 81287.24,
            "range": "± 262.93 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=81287.24ns p75=81550.16ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1325.49,
            "range": "± 8.34 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1325.49ns p75=1333.82ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4249.62,
            "range": "± 16.33 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4249.62ns p75=4265.95ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 30102.21,
            "range": "± 127.41 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=30102.21ns p75=30229.63ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 316205.24,
            "range": "± 1962.47 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=316205.24ns p75=318167.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1257.57,
            "range": "± 37.19 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1257.57ns p75=1294.76ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1973.42,
            "range": "± 9.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1973.42ns p75=1983.21ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1396.76,
            "range": "± 6.23 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1396.76ns p75=1402.98ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 2016.39,
            "range": "± 8.39 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=2016.39ns p75=2024.77ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1300.55,
            "range": "± 5.97 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1300.55ns p75=1306.52ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3125.75,
            "range": "± 23 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3125.75ns p75=3148.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3636.73,
            "range": "± 18.83 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3636.73ns p75=3655.56ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4426.65,
            "range": "± 19.4 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4426.65ns p75=4446.05ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3040.91,
            "range": "± 12.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3040.91ns p75=3053.04ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4135.75,
            "range": "± 35.21 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4135.75ns p75=4170.95ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2206.84,
            "range": "± 17.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2206.84ns p75=2224.19ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8029.41,
            "range": "± 24.91 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8029.41ns p75=8054.32ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7986.99,
            "range": "± 33 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7986.99ns p75=8019.99ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10730.79,
            "range": "± 21.77 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10730.79ns p75=10752.56ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9656,
            "range": "± 36.82 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9656ns p75=9692.81ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 81767.11,
            "range": "± 137.2 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=81767.11ns p75=81904.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1085.54,
            "range": "± 6.22 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1085.54ns p75=1091.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1793.92,
            "range": "± 6.78 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1793.92ns p75=1800.7ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1232.78,
            "range": "± 6.88 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1232.78ns p75=1239.65ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1872.82,
            "range": "± 9.05 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1872.82ns p75=1881.87ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1160.66,
            "range": "± 5.15 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1160.66ns p75=1165.81ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3051.06,
            "range": "± 18.47 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3051.06ns p75=3069.53ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3554.53,
            "range": "± 26.16 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3554.53ns p75=3580.69ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4853.43,
            "range": "± 27.73 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4853.43ns p75=4881.15ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4021.24,
            "range": "± 34.73 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4021.24ns p75=4055.97ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2010.14,
            "range": "± 18.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2010.14ns p75=2028.42ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10946.27,
            "range": "± 33.18 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10946.27ns p75=10979.45ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10978.79,
            "range": "± 24.75 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10978.79ns p75=11003.54ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 93380.8,
            "range": "± 84.47 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=93380.8ns p75=93465.27ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "9f1a61830afbf39b61dac460f16a9d19c9184798",
          "message": "ci: run Dependabot bun updates monthly\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-08-01T12:39:39+02:00",
          "tree_id": "5efc3bce451a7584458e264a7d1f022fa5219d3a",
          "url": "https://github.com/edloidas/roll-parser/commit/9f1a61830afbf39b61dac460f16a9d19c9184798"
        },
        "date": 1785581002922,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 131.13,
            "range": "± 2.74 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=131.13ns p75=133.87ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 199.91,
            "range": "± 0.92 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=199.91ns p75=200.83ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 113.05,
            "range": "± 2.88 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=113.05ns p75=115.93ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 181.01,
            "range": "± 168.32 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=181.01ns p75=349.33ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 76.29,
            "range": "± 58.66 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=76.29ns p75=134.95ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 218.49,
            "range": "± 2.04 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=218.49ns p75=220.53ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 352.01,
            "range": "± 2.74 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=352.01ns p75=354.75ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 283.03,
            "range": "± 1.35 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=283.03ns p75=284.38ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 217.93,
            "range": "± 0.8 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=217.93ns p75=218.73ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 549.85,
            "range": "± 3.91 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=549.85ns p75=553.76ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 231.37,
            "range": "± 1.48 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=231.37ns p75=232.85ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 263.95,
            "range": "± 2.4 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=263.95ns p75=266.35ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 559.79,
            "range": "± 3.1 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=559.79ns p75=562.9ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1227.79,
            "range": "± 10.61 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1227.79ns p75=1238.4ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 128.03,
            "range": "± 2.46 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=128.03ns p75=130.49ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 130.46,
            "range": "± 0.65 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=130.46ns p75=131.11ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 293.41,
            "range": "± 2.7 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=293.41ns p75=296.1ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 499.03,
            "range": "± 3.89 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=499.03ns p75=502.92ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 240.37,
            "range": "± 0.66 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=240.37ns p75=241.03ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 440.47,
            "range": "± 1.51 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=440.47ns p75=441.98ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 145.68,
            "range": "± 1.39 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=145.68ns p75=147.07ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 505.05,
            "range": "± 3.08 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=505.05ns p75=508.13ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 791.13,
            "range": "± 5.51 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=791.13ns p75=796.64ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 679.19,
            "range": "± 5.09 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=679.19ns p75=684.28ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 509.01,
            "range": "± 3 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=509.01ns p75=512.02ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1200.86,
            "range": "± 11.36 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1200.86ns p75=1212.22ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 553.02,
            "range": "± 3.23 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=553.02ns p75=556.26ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 664.83,
            "range": "± 4.92 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=664.83ns p75=669.75ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1463.41,
            "range": "± 7.9 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1463.41ns p75=1471.32ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2909.05,
            "range": "± 15.34 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2909.05ns p75=2924.39ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 289.6,
            "range": "± 2.59 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=289.6ns p75=292.19ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 291.36,
            "range": "± 2.23 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=291.36ns p75=293.59ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 677.81,
            "range": "± 3.24 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=677.81ns p75=681.05ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1093.53,
            "range": "± 9.83 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1093.53ns p75=1103.36ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 842.05,
            "range": "± 4.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=842.05ns p75=846.31ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1192.94,
            "range": "± 6.46 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1192.94ns p75=1199.4ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 869.08,
            "range": "± 6.16 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=869.08ns p75=875.24ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2172.32,
            "range": "± 24.05 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2172.32ns p75=2196.36ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2397.04,
            "range": "± 23.84 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2397.04ns p75=2420.88ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3410.6,
            "range": "± 22.71 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3410.6ns p75=3433.31ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2173.78,
            "range": "± 24.13 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2173.78ns p75=2197.91ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2572.02,
            "range": "± 28.05 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2572.02ns p75=2600.07ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1182.42,
            "range": "± 9.14 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1182.42ns p75=1191.56ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6985.13,
            "range": "± 71.97 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6985.13ns p75=7057.1ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6297.25,
            "range": "± 66.37 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6297.25ns p75=6363.62ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7056.08,
            "range": "± 30.21 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7056.08ns p75=7086.29ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8709.74,
            "range": "± 42.04 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8709.74ns p75=8751.78ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 79282.36,
            "range": "± 392.82 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=79282.36ns p75=79675.18ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 690.19,
            "range": "± 5.98 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=690.19ns p75=696.16ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1546.29,
            "range": "± 12.04 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1546.29ns p75=1558.33ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8787.83,
            "range": "± 37.36 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8787.83ns p75=8825.19ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 78614.78,
            "range": "± 136.2 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=78614.78ns p75=78750.98ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1365.06,
            "range": "± 23.06 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1365.06ns p75=1388.12ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4198.97,
            "range": "± 26.53 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4198.97ns p75=4225.5ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 29560.65,
            "range": "± 1.71 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=29560.65ns p75=29562.36ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 301362.97,
            "range": "± 730.49 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=301362.97ns p75=302093.46ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1275.55,
            "range": "± 30.49 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1275.55ns p75=1306.04ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1945.82,
            "range": "± 13.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1945.82ns p75=1959.23ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1380.93,
            "range": "± 7.09 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1380.93ns p75=1388.01ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1974.09,
            "range": "± 15.07 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1974.09ns p75=1989.16ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1295.82,
            "range": "± 11.98 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1295.82ns p75=1307.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3168.22,
            "range": "± 26.86 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3168.22ns p75=3195.09ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3628.8,
            "range": "± 14.82 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3628.8ns p75=3643.62ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4425.87,
            "range": "± 24.43 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4425.87ns p75=4450.3ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3131.75,
            "range": "± 29.51 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3131.75ns p75=3161.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4242.98,
            "range": "± 22.83 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4242.98ns p75=4265.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2185.66,
            "range": "± 31.45 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2185.66ns p75=2217.11ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8181.68,
            "range": "± 32.61 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8181.68ns p75=8214.29ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8638.49,
            "range": "± 172.56 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8638.49ns p75=8811.05ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10727.36,
            "range": "± 22.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10727.36ns p75=10750.25ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9323.95,
            "range": "± 32.42 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9323.95ns p75=9356.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 79086.42,
            "range": "± 47.81 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=79086.42ns p75=79134.23ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1082.96,
            "range": "± 12.55 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1082.96ns p75=1095.51ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1769.69,
            "range": "± 13.89 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1769.69ns p75=1783.58ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1232.24,
            "range": "± 7.91 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1232.24ns p75=1240.15ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1823.23,
            "range": "± 16.46 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1823.23ns p75=1839.69ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1159.86,
            "range": "± 11.64 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1159.86ns p75=1171.49ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3065.63,
            "range": "± 11.64 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3065.63ns p75=3077.27ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3582.97,
            "range": "± 52.11 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3582.97ns p75=3635.09ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4717.22,
            "range": "± 63.46 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4717.22ns p75=4780.68ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4088.32,
            "range": "± 35.19 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4088.32ns p75=4123.5ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1994.11,
            "range": "± 35.22 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1994.11ns p75=2029.32ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10369.78,
            "range": "± 93.95 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10369.78ns p75=10463.73ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10401.21,
            "range": "± 17.01 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10401.21ns p75=10418.22ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 88337.53,
            "range": "± 260.69 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=88337.53ns p75=88598.22ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1ed4b7834703dde57de787e21ce2f04488d97046",
          "message": "test: add SeededRNG golden vector for a high-rejection range #156 (#173)\n\nAdded a `reject` field to every golden vector, drawing six values from\n`nextInt(0, 2 ** 31)` — range `2^31 + 1`, one acceptance zone, ~50%\nrejection per draw\nGenerated the values from the shipped implementation and verified each\nvector crosses the resample loop at least once (1-10 rejections)\nExtended the block comment to explain why `d6` never reaches the\nresample path and `reject` does\n\nCo-authored-by: Claude Opus 5 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-08-01T13:53:22+03:00",
          "tree_id": "ec3f7eb3c6b88cc50882c03819f7e2009dba7f22",
          "url": "https://github.com/edloidas/roll-parser/commit/1ed4b7834703dde57de787e21ce2f04488d97046"
        },
        "date": 1785581799414,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 135.43,
            "range": "± 6.61 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=135.43ns p75=142.04ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 205.25,
            "range": "± 1.45 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=205.25ns p75=206.69ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 125.81,
            "range": "± 2.53 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=125.81ns p75=128.34ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 193.82,
            "range": "± 2.92 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=193.82ns p75=196.74ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 88.66,
            "range": "± 47.73 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=88.66ns p75=136.39ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 225.26,
            "range": "± 201.63 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=225.26ns p75=426.89ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 351.58,
            "range": "± 1.21 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=351.58ns p75=352.79ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 280.06,
            "range": "± 2.5 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=280.06ns p75=282.56ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 215.85,
            "range": "± 0.53 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=215.85ns p75=216.38ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 553.62,
            "range": "± 4.16 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=553.62ns p75=557.78ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 246.12,
            "range": "± 1.36 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=246.12ns p75=247.48ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 270.67,
            "range": "± 2.41 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=270.67ns p75=273.07ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 566.31,
            "range": "± 3.46 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=566.31ns p75=569.76ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1201.6,
            "range": "± 8.3 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1201.6ns p75=1209.9ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 129.32,
            "range": "± 0.51 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=129.32ns p75=129.83ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 132.21,
            "range": "± 2.67 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=132.21ns p75=134.88ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 292.34,
            "range": "± 3.17 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=292.34ns p75=295.51ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 521.84,
            "range": "± 4.63 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=521.84ns p75=526.47ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 240.33,
            "range": "± 1 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=240.33ns p75=241.32ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 470.9,
            "range": "± 2.98 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=470.9ns p75=473.87ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 148.58,
            "range": "± 2.27 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=148.58ns p75=150.85ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 515.57,
            "range": "± 3.41 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=515.57ns p75=518.98ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 818.04,
            "range": "± 5.05 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=818.04ns p75=823.09ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 694.24,
            "range": "± 6.15 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=694.24ns p75=700.39ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 513.27,
            "range": "± 2.83 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=513.27ns p75=516.1ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1217.26,
            "range": "± 8.98 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1217.26ns p75=1226.24ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 541.86,
            "range": "± 2.76 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=541.86ns p75=544.62ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 667.44,
            "range": "± 3.04 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=667.44ns p75=670.48ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1444.25,
            "range": "± 10.64 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1444.25ns p75=1454.89ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2816.96,
            "range": "± 11.63 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2816.96ns p75=2828.6ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 284.01,
            "range": "± 2.32 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=284.01ns p75=286.32ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 286.85,
            "range": "± 2.87 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=286.85ns p75=289.72ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 667.73,
            "range": "± 3.73 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=667.73ns p75=671.46ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1091.43,
            "range": "± 4.86 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1091.43ns p75=1096.29ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 831.25,
            "range": "± 4.38 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=831.25ns p75=835.63ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1194.52,
            "range": "± 4.91 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1194.52ns p75=1199.44ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 843.27,
            "range": "± 4.06 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=843.27ns p75=847.33ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2086.66,
            "range": "± 11.43 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2086.66ns p75=2098.09ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2271.07,
            "range": "± 22.52 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2271.07ns p75=2293.59ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3307.67,
            "range": "± 35.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3307.67ns p75=3343.56ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2081.38,
            "range": "± 14.95 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2081.38ns p75=2096.33ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2489.24,
            "range": "± 27.92 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2489.24ns p75=2517.15ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1164.9,
            "range": "± 3.59 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1164.9ns p75=1168.49ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6664.37,
            "range": "± 103.36 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6664.37ns p75=6767.73ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5955.67,
            "range": "± 187.11 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5955.67ns p75=6142.78ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 6784.6,
            "range": "± 44.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=6784.6ns p75=6829.34ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8395.13,
            "range": "± 28.84 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8395.13ns p75=8423.97ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 77215.22,
            "range": "± 177.59 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=77215.22ns p75=77392.82ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 685.51,
            "range": "± 5.35 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=685.51ns p75=690.86ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1489.38,
            "range": "± 7.3 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1489.38ns p75=1496.68ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8535.11,
            "range": "± 37.13 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8535.11ns p75=8572.23ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 77154.91,
            "range": "± 141.23 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=77154.91ns p75=77296.14ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1350.49,
            "range": "± 11.7 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1350.49ns p75=1362.19ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4128.21,
            "range": "± 39.36 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4128.21ns p75=4167.57ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 29479.86,
            "range": "± 47.11 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=29479.86ns p75=29526.97ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 300000.89,
            "range": "± 943.62 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=300000.89ns p75=300944.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1226.11,
            "range": "± 37.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1226.11ns p75=1263.46ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1862.29,
            "range": "± 9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1862.29ns p75=1871.29ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1351.54,
            "range": "± 10.03 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1351.54ns p75=1361.57ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1897.33,
            "range": "± 9.49 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1897.33ns p75=1906.82ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1261.54,
            "range": "± 9.74 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1261.54ns p75=1271.29ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3054.48,
            "range": "± 31.08 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3054.48ns p75=3085.55ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3524.33,
            "range": "± 20.19 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3524.33ns p75=3544.52ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4365.45,
            "range": "± 35.8 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4365.45ns p75=4401.25ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2960.92,
            "range": "± 27.55 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2960.92ns p75=2988.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4156.98,
            "range": "± 49.18 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4156.98ns p75=4206.16ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2121.92,
            "range": "± 23.68 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2121.92ns p75=2145.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8035.7,
            "range": "± 50.4 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8035.7ns p75=8086.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8329.97,
            "range": "± 76.18 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8329.97ns p75=8406.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10408.35,
            "range": "± 27.54 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10408.35ns p75=10435.88ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9200.04,
            "range": "± 43.03 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9200.04ns p75=9243.07ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 77333.05,
            "range": "± 72.9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=77333.05ns p75=77405.95ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1086.09,
            "range": "± 7.63 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1086.09ns p75=1093.73ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1700.08,
            "range": "± 17.49 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1700.08ns p75=1717.57ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1232.12,
            "range": "± 8.05 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1232.12ns p75=1240.17ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1751.98,
            "range": "± 8.34 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1751.98ns p75=1760.33ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1150.89,
            "range": "± 7.97 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1150.89ns p75=1158.86ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2938.1,
            "range": "± 16.16 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2938.1ns p75=2954.26ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3403.62,
            "range": "± 37.97 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3403.62ns p75=3441.59ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4648.27,
            "range": "± 103.06 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4648.27ns p75=4751.33ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4061.42,
            "range": "± 51.33 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4061.42ns p75=4112.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1931.25,
            "range": "± 27.9 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1931.25ns p75=1959.15ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10644.35,
            "range": "± 25.45 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10644.35ns p75=10669.8ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10316.5,
            "range": "± 40.13 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10316.5ns p75=10356.63ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 87990.09,
            "range": "± 648.37 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=87990.09ns p75=88638.46ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "fc9c70d9431489ec4c92f677da8bc306947eba7b",
          "message": "test: add SeededRNG golden vector for the two-draw rejection path #172\n\nAdded a `wideReject` field drawing from `nextInt(0, 2 ** 52)`, where `nextBoundedWide` rejects half of all composed values\nGenerated the vectors from the shipped implementation and cross-checked them against an independent replay of the raw uint32 stream\nDocumented why `wide` and `safe` can never reach the two-draw resample loop",
          "timestamp": "2026-08-01T14:02:20+03:00",
          "tree_id": "1a1d6ea640dfff81a3bd209992030ac90b24b49e",
          "url": "https://github.com/edloidas/roll-parser/commit/fc9c70d9431489ec4c92f677da8bc306947eba7b"
        },
        "date": 1785582333092,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 108.47,
            "range": "± 0.83 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=108.47ns p75=109.31ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 164.29,
            "range": "± 1.07 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=164.29ns p75=165.36ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 90.49,
            "range": "± 4.23 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=90.49ns p75=94.73ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 151.05,
            "range": "± 4.86 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=151.05ns p75=155.91ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 61.84,
            "range": "± 3.43 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=61.84ns p75=65.26ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 184.63,
            "range": "± 1.33 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=184.63ns p75=185.96ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 285.3,
            "range": "± 1.3 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=285.3ns p75=286.6ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 226.55,
            "range": "± 1.41 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=226.55ns p75=227.96ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 176.32,
            "range": "± 1.33 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=176.32ns p75=177.64ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 425.45,
            "range": "± 2.08 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=425.45ns p75=427.53ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 188.01,
            "range": "± 0.5 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=188.01ns p75=188.5ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 215.98,
            "range": "± 0.55 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=215.98ns p75=216.52ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 454.65,
            "range": "± 1.17 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=454.65ns p75=455.81ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 945.34,
            "range": "± 4.81 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=945.34ns p75=950.14ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 102.1,
            "range": "± 4.48 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=102.1ns p75=106.57ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 104.2,
            "range": "± 3.04 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=104.2ns p75=107.24ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 213.32,
            "range": "± 0.86 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=213.32ns p75=214.18ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 331.5,
            "range": "± 2.63 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=331.5ns p75=334.12ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 183.15,
            "range": "± 0.94 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=183.15ns p75=184.09ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 301.53,
            "range": "± 1.66 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=301.53ns p75=303.2ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 116.47,
            "range": "± 2.2 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=116.47ns p75=118.67ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 347.21,
            "range": "± 4.07 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=347.21ns p75=351.28ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 567.42,
            "range": "± 3 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=567.42ns p75=570.42ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 471.96,
            "range": "± 2.14 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=471.96ns p75=474.1ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 352.25,
            "range": "± 1.72 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=352.25ns p75=353.97ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 894.15,
            "range": "± 5.88 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=894.15ns p75=900.03ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 353.98,
            "range": "± 1.53 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=353.98ns p75=355.51ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 455.45,
            "range": "± 1.49 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=455.45ns p75=456.94ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1078.97,
            "range": "± 4.95 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1078.97ns p75=1083.92ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2232.22,
            "range": "± 16.86 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2232.22ns p75=2249.08ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 204.81,
            "range": "± 0.62 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=204.81ns p75=205.43ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 207.89,
            "range": "± 1.36 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=207.89ns p75=209.25ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 470.85,
            "range": "± 2.7 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=470.85ns p75=473.55ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 812.87,
            "range": "± 7.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=812.87ns p75=819.96ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 577.93,
            "range": "± 2.9 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=577.93ns p75=580.84ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 893.26,
            "range": "± 6.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=893.26ns p75=900ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 632.65,
            "range": "± 2.71 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=632.65ns p75=635.36ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1704.18,
            "range": "± 13.79 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1704.18ns p75=1717.97ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1937.51,
            "range": "± 22.84 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1937.51ns p75=1960.35ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2676.79,
            "range": "± 14.08 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2676.79ns p75=2690.87ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1716.97,
            "range": "± 20.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1716.97ns p75=1737.15ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2066.13,
            "range": "± 13.1 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2066.13ns p75=2079.23ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 895.55,
            "range": "± 7.45 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=895.55ns p75=902.99ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 5472.2,
            "range": "± 58 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=5472.2ns p75=5530.2ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5000.21,
            "range": "± 71.19 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5000.21ns p75=5071.4ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 5969.91,
            "range": "± 33.62 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=5969.91ns p75=6003.53ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 7326.45,
            "range": "± 25.14 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=7326.45ns p75=7351.6ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 66208.51,
            "range": "± 603.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=66208.51ns p75=66812.41ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 474.17,
            "range": "± 3.35 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=474.17ns p75=477.52ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1163.06,
            "range": "± 24.34 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1163.06ns p75=1187.4ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 7298.15,
            "range": "± 27.11 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=7298.15ns p75=7325.26ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 66850.78,
            "range": "± 144.56 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=66850.78ns p75=66995.35ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1052.94,
            "range": "± 10.42 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1052.94ns p75=1063.36ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3436.77,
            "range": "± 16.36 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3436.77ns p75=3453.13ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 24122.42,
            "range": "± 61.4 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=24122.42ns p75=24183.82ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 250760.78,
            "range": "± 1148.63 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=250760.78ns p75=251909.41ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 990.55,
            "range": "± 25.55 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=990.55ns p75=1016.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1578.7,
            "range": "± 11.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1578.7ns p75=1589.83ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1084.08,
            "range": "± 10.1 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1084.08ns p75=1094.18ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1616.85,
            "range": "± 14.99 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1616.85ns p75=1631.84ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 984.32,
            "range": "± 13.56 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=984.32ns p75=997.89ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2541.8,
            "range": "± 13.22 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2541.8ns p75=2555.02ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 2918.76,
            "range": "± 13.26 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=2918.76ns p75=2932.02ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 3496.97,
            "range": "± 18.06 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=3496.97ns p75=3515.03ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2456.34,
            "range": "± 13.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2456.34ns p75=2470ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3348.66,
            "range": "± 28.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3348.66ns p75=3377.11ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1774.85,
            "range": "± 22.75 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1774.85ns p75=1797.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 6434.77,
            "range": "± 25.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=6434.77ns p75=6460.18ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 6452.77,
            "range": "± 26.6 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=6452.77ns p75=6479.36ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 8764.75,
            "range": "± 31.45 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=8764.75ns p75=8796.2ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 7834.83,
            "range": "± 35.8 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=7834.83ns p75=7870.63ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 67054.98,
            "range": "± 176.31 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=67054.98ns p75=67231.29ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 838.55,
            "range": "± 9.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=838.55ns p75=847.82ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1426.69,
            "range": "± 12.5 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1426.69ns p75=1439.18ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 972.58,
            "range": "± 10.26 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=972.58ns p75=982.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1519.06,
            "range": "± 8.67 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1519.06ns p75=1527.73ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 908.56,
            "range": "± 8.27 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=908.56ns p75=916.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2501.72,
            "range": "± 18.63 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2501.72ns p75=2520.35ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 2849.89,
            "range": "± 22.68 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=2849.89ns p75=2872.57ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 3834.99,
            "range": "± 17.74 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=3834.99ns p75=3852.73ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3236.49,
            "range": "± 16.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3236.49ns p75=3252.88ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1661.98,
            "range": "± 7.55 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1661.98ns p75=1669.53ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 8695.93,
            "range": "± 20.87 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=8695.93ns p75=8716.8ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 8839.48,
            "range": "± 64.32 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=8839.48ns p75=8903.8ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 75575.17,
            "range": "± 146.27 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=75575.17ns p75=75721.44ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "a2ce2eed4938c8cf404cc8e627aca7955d11638c",
          "message": "ci: gate benchmarks to master and pack the tarball once #166\n\nGated the `bench` job to default-branch pushes and `workflow_dispatch`, adding the dispatch trigger.\nMoved `npm pack` into the `build` job as a pinned-npm, `--ignore-scripts` step matching release.yml, uploaded as the `npm-tarball` artifact.\nPointed all five `node-smoke` legs and `browser-smoke` at the shared tarball, dropping five redundant packs.\nRemoved the now-unused checkout and `dist` download from `node-smoke`.",
          "timestamp": "2026-08-01T14:10:06+03:00",
          "tree_id": "e03d048c85593c73ed92f3f558433294ef32bbe6",
          "url": "https://github.com/edloidas/roll-parser/commit/a2ce2eed4938c8cf404cc8e627aca7955d11638c"
        },
        "date": 1785582792914,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 89.86,
            "range": "± 2.7 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=89.86ns p75=92.56ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 146.74,
            "range": "± 6.56 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=146.74ns p75=153.29ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 77.61,
            "range": "± 15.6 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=77.61ns p75=93.21ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 131.89,
            "range": "± 2.05 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=131.89ns p75=133.93ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 51.79,
            "range": "± 3.69 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=51.79ns p75=55.48ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 157.8,
            "range": "± 4.89 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=157.8ns p75=162.7ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 248.36,
            "range": "± 2.69 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=248.36ns p75=251.04ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 208.27,
            "range": "± 4.01 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=208.27ns p75=212.28ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 155.12,
            "range": "± 1.73 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=155.12ns p75=156.84ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 416.84,
            "range": "± 6.18 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=416.84ns p75=423.02ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 163.5,
            "range": "± 1.39 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=163.5ns p75=164.89ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 191.76,
            "range": "± 2.13 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=191.76ns p75=193.89ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 408.55,
            "range": "± 5.54 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=408.55ns p75=414.08ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 867.66,
            "range": "± 10.87 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=867.66ns p75=878.53ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 87.71,
            "range": "± 4.13 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=87.71ns p75=91.84ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 90.13,
            "range": "± 3.94 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=90.13ns p75=94.07ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 215.74,
            "range": "± 3.45 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=215.74ns p75=219.19ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 352.4,
            "range": "± 4.96 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=352.4ns p75=357.37ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 183.07,
            "range": "± 2.53 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=183.07ns p75=185.59ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 320.34,
            "range": "± 3.08 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=320.34ns p75=323.42ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 106.79,
            "range": "± 3.91 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=106.79ns p75=110.7ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 361.67,
            "range": "± 3.23 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=361.67ns p75=364.9ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 564.82,
            "range": "± 4.38 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=564.82ns p75=569.2ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 490.27,
            "range": "± 6.19 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=490.27ns p75=496.46ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 372.06,
            "range": "± 4.76 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=372.06ns p75=376.81ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 832.34,
            "range": "± 4.94 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=832.34ns p75=837.28ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 363,
            "range": "± 3.3 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=363ns p75=366.3ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 460.96,
            "range": "± 3.9 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=460.96ns p75=464.85ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1021.58,
            "range": "± 4.8 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1021.58ns p75=1026.38ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 1970.82,
            "range": "± 10.37 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=1970.82ns p75=1981.2ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 215.46,
            "range": "± 3.13 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=215.46ns p75=218.59ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 217.87,
            "range": "± 2.67 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=217.87ns p75=220.54ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 473.11,
            "range": "± 10.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=473.11ns p75=483.99ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 769.95,
            "range": "± 6.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=769.95ns p75=776.61ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 593.36,
            "range": "± 7.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=593.36ns p75=600.65ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 847.68,
            "range": "± 3.6 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=847.68ns p75=851.27ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 720.58,
            "range": "± 8.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=720.58ns p75=729.53ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1544.58,
            "range": "± 8.53 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1544.58ns p75=1553.11ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1686.57,
            "range": "± 10.95 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1686.57ns p75=1697.52ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2661.22,
            "range": "± 14.19 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2661.22ns p75=2675.41ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1651.97,
            "range": "± 11.02 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1651.97ns p75=1662.99ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 1903.78,
            "range": "± 13.46 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=1903.78ns p75=1917.25ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 821.21,
            "range": "± 5.11 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=821.21ns p75=826.33ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 5483.47,
            "range": "± 47.05 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=5483.47ns p75=5530.51ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 4433.64,
            "range": "± 60.51 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=4433.64ns p75=4494.16ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 5299.42,
            "range": "± 31.7 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=5299.42ns p75=5331.12ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 6529.35,
            "range": "± 27.81 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=6529.35ns p75=6557.16ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 60745.71,
            "range": "± 366.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=60745.71ns p75=61112.15ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 490.89,
            "range": "± 6.29 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=490.89ns p75=497.18ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1157.9,
            "range": "± 5.61 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1157.9ns p75=1163.52ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 6455.1,
            "range": "± 24.48 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=6455.1ns p75=6479.58ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 59597.56,
            "range": "± 129.08 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=59597.56ns p75=59726.64ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 929.77,
            "range": "± 6.06 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=929.77ns p75=935.83ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3230.77,
            "range": "± 24.39 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3230.77ns p75=3255.16ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 22554.32,
            "range": "± 50.69 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=22554.32ns p75=22605.01ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 250874.43,
            "range": "± 773.91 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=250874.43ns p75=251648.34ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 855.79,
            "range": "± 17.85 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=855.79ns p75=873.64ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1448.78,
            "range": "± 5.48 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1448.78ns p75=1454.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 952.84,
            "range": "± 6.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=952.84ns p75=959.3ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1470.72,
            "range": "± 5.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1470.72ns p75=1476.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 904.9,
            "range": "± 6.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=904.9ns p75=911.83ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2307.6,
            "range": "± 9.38 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2307.6ns p75=2316.98ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 2734.44,
            "range": "± 11.07 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=2734.44ns p75=2745.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 3498.89,
            "range": "± 9.98 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=3498.89ns p75=3508.87ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2356.44,
            "range": "± 8.77 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2356.44ns p75=2365.21ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3111.04,
            "range": "± 14.1 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3111.04ns p75=3125.14ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1663.16,
            "range": "± 15.75 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1663.16ns p75=1678.91ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 6271.09,
            "range": "± 17.19 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=6271.09ns p75=6288.28ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 5702.21,
            "range": "± 24.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=5702.21ns p75=5727.07ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 7974.72,
            "range": "± 35.15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=7974.72ns p75=8009.86ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 7054.31,
            "range": "± 24.7 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=7054.31ns p75=7079ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 59767.66,
            "range": "± 326.86 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=59767.66ns p75=60094.51ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 723.03,
            "range": "± 11.8 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=723.03ns p75=734.83ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1311.6,
            "range": "± 8.93 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1311.6ns p75=1320.53ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 864.95,
            "range": "± 12.29 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=864.95ns p75=877.24ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1360.78,
            "range": "± 7.93 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1360.78ns p75=1368.71ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 829.36,
            "range": "± 7.48 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=829.36ns p75=836.85ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2281.55,
            "range": "± 12.16 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2281.55ns p75=2293.71ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 2553.23,
            "range": "± 20.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=2553.23ns p75=2573.63ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4027.83,
            "range": "± 24.02 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4027.83ns p75=4051.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 2992.84,
            "range": "± 24.45 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=2992.84ns p75=3017.28ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1509.58,
            "range": "± 14.79 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1509.58ns p75=1524.37ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 7854.2,
            "range": "± 51.3 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=7854.2ns p75=7905.5ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 8498.28,
            "range": "± 21.77 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=8498.28ns p75=8520.05ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 72911.17,
            "range": "± 235.64 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=72911.17ns p75=73146.81ns mode=batch"
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
          "id": "069713e90ddae3fde1fd4d4eeefeb69fe8a018f3",
          "message": "build: strip comments from emitted JS via two-pass compile #165\n\nAdded `tsconfig.build.types.json` for the declaration-only pass\nSet `removeComments` and disabled declarations in `tsconfig.build.json`\nChained both `tsc` passes in the `build` script, `chmod +x` still last\nMirrored both passes in `package-smoke.test.ts`'s `beforeAll` build\nAdded two-pass emit assertions covering JS comments, TSDoc, and both map kinds",
          "timestamp": "2026-08-01T16:53:23+03:00",
          "tree_id": "e8b5ac4a64f5bd34ea4a1d8a02df4b8b739dfc12",
          "url": "https://github.com/edloidas/roll-parser/commit/069713e90ddae3fde1fd4d4eeefeb69fe8a018f3"
        },
        "date": 1785592604322,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 129.73,
            "range": "± 4.78 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=129.73ns p75=134.52ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 196.48,
            "range": "± 0.93 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=196.48ns p75=197.41ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 111.83,
            "range": "± 3.51 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=111.83ns p75=115.34ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 180.33,
            "range": "± 4.29 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=180.33ns p75=184.62ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 73.2,
            "range": "± 6.52 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=73.2ns p75=79.71ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 218.69,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=218.69ns p75=220.48ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 351.48,
            "range": "± 2.47 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=351.48ns p75=353.94ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 280.26,
            "range": "± 2.45 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=280.26ns p75=282.71ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 212,
            "range": "± 0.72 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=212ns p75=212.72ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 551.98,
            "range": "± 3.63 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=551.98ns p75=555.61ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 225.79,
            "range": "± 1.04 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=225.79ns p75=226.83ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 265.13,
            "range": "± 2.39 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=265.13ns p75=267.51ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 554.52,
            "range": "± 3.64 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=554.52ns p75=558.15ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1209.27,
            "range": "± 5.53 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1209.27ns p75=1214.79ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 127.65,
            "range": "± 2.26 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=127.65ns p75=129.92ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 129.92,
            "range": "± 2.54 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=129.92ns p75=132.46ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 298.17,
            "range": "± 2.12 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=298.17ns p75=300.28ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 512.99,
            "range": "± 2.29 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=512.99ns p75=515.28ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 246.7,
            "range": "± 1.43 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=246.7ns p75=248.13ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 448.49,
            "range": "± 2.4 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=448.49ns p75=450.88ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 150.8,
            "range": "± 3.13 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=150.8ns p75=153.93ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 509.13,
            "range": "± 3.54 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=509.13ns p75=512.67ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 788.74,
            "range": "± 5.66 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=788.74ns p75=794.4ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 699.06,
            "range": "± 4.83 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=699.06ns p75=703.89ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 520.2,
            "range": "± 2.38 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=520.2ns p75=522.59ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1216.89,
            "range": "± 12.55 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1216.89ns p75=1229.44ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 561.88,
            "range": "± 2.91 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=561.88ns p75=564.79ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 672.44,
            "range": "± 2.51 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=672.44ns p75=674.95ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1449.57,
            "range": "± 5.75 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1449.57ns p75=1455.32ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2899.84,
            "range": "± 19.67 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2899.84ns p75=2919.51ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 300,
            "range": "± 2.46 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=300ns p75=302.46ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 304.1,
            "range": "± 2.46 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=304.1ns p75=306.56ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 657.31,
            "range": "± 4.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=657.31ns p75=661.88ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1077.08,
            "range": "± 14.42 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1077.08ns p75=1091.5ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 822.98,
            "range": "± 4.08 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=822.98ns p75=827.07ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1188.86,
            "range": "± 6.63 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1188.86ns p75=1195.49ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 855.62,
            "range": "± 3.8 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=855.62ns p75=859.42ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2198.04,
            "range": "± 18.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2198.04ns p75=2216.13ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2414.13,
            "range": "± 16.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2414.13ns p75=2430.32ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3386.06,
            "range": "± 33.43 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3386.06ns p75=3419.49ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2122.18,
            "range": "± 20.06 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2122.18ns p75=2142.25ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2587.12,
            "range": "± 18.96 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2587.12ns p75=2606.08ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1167.83,
            "range": "± 6.62 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1167.83ns p75=1174.45ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6974.55,
            "range": "± 85.33 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6974.55ns p75=7059.88ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6233.69,
            "range": "± 114.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6233.69ns p75=6348.37ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7131.44,
            "range": "± 49.53 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7131.44ns p75=7180.97ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8614.24,
            "range": "± 28.9 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8614.24ns p75=8643.14ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 78253.89,
            "range": "± 441.82 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=78253.89ns p75=78695.72ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 703.07,
            "range": "± 3.93 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=703.07ns p75=707.01ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1576.9,
            "range": "± 17.97 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1576.9ns p75=1594.86ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8696.72,
            "range": "± 48.14 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8696.72ns p75=8744.87ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 79016.28,
            "range": "± 736.04 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=79016.28ns p75=79752.32ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1391.19,
            "range": "± 8.51 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1391.19ns p75=1399.7ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4278.03,
            "range": "± 28.35 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4278.03ns p75=4306.38ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 30225.22,
            "range": "± 75.85 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=30225.22ns p75=30301.07ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 306228.1,
            "range": "± 483.45 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=306228.1ns p75=306711.55ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1274.62,
            "range": "± 19.76 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1274.62ns p75=1294.39ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1959.38,
            "range": "± 20.36 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1959.38ns p75=1979.74ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1387.3,
            "range": "± 8.72 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1387.3ns p75=1396.01ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1994.86,
            "range": "± 14.26 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1994.86ns p75=2009.12ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1286.56,
            "range": "± 10.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1286.56ns p75=1297.48ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3216.09,
            "range": "± 21.71 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3216.09ns p75=3237.79ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3690.45,
            "range": "± 16.43 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3690.45ns p75=3706.88ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4450.72,
            "range": "± 16.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4450.72ns p75=4467.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3079.66,
            "range": "± 27.96 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3079.66ns p75=3107.62ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4327.71,
            "range": "± 42.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4327.71ns p75=4370.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2174.41,
            "range": "± 26.25 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2174.41ns p75=2200.66ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8211.31,
            "range": "± 21.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8211.31ns p75=8233.24ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8641.06,
            "range": "± 54.09 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8641.06ns p75=8695.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10722.13,
            "range": "± 32.64 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10722.13ns p75=10754.78ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9307.5,
            "range": "± 37.91 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9307.5ns p75=9345.41ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 78609.85,
            "range": "± 376.39 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=78609.85ns p75=78986.24ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1077.82,
            "range": "± 11.56 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1077.82ns p75=1089.38ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1753.31,
            "range": "± 15.85 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1753.31ns p75=1769.16ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1220.04,
            "range": "± 8.3 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1220.04ns p75=1228.34ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1787.65,
            "range": "± 13.17 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1787.65ns p75=1800.82ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1150.86,
            "range": "± 10.19 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1150.86ns p75=1161.05ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3102.91,
            "range": "± 28.78 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3102.91ns p75=3131.7ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3651.16,
            "range": "± 32.38 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3651.16ns p75=3683.53ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4694.04,
            "range": "± 67.52 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4694.04ns p75=4761.55ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4042.83,
            "range": "± 49 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4042.83ns p75=4091.83ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1942.94,
            "range": "± 29.57 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1942.94ns p75=1972.51ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10472.43,
            "range": "± 34.31 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10472.43ns p75=10506.74ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10453.07,
            "range": "± 33.66 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10453.07ns p75=10486.74ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 88758.42,
            "range": "± 189.98 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=88758.42ns p75=88948.41ns mode=batch"
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
          "id": "14c2003504bc968c45864084639af52c4bc57462",
          "message": "perf: add keep/drop count === 1 fast path #164\n\nAdded `markSingleExtreme` linear scan replacing per-die wrapper allocation and comparator sort when `count === 1`.\nPreserved first-occurrence tie-break via strict comparison and mask-union semantics by never clearing bits.\nAdded tests for ties in all four keep/drop x highest/lowest combos, chained specs on a shared mask, and pools with rerolled, meta, and previously dropped dice.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-01T16:58:07+03:00",
          "tree_id": "30bd3524fc612cf4b1adb24a7758272dd255eafc",
          "url": "https://github.com/edloidas/roll-parser/commit/14c2003504bc968c45864084639af52c4bc57462"
        },
        "date": 1785592882215,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 130.88,
            "range": "± 3.03 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=130.88ns p75=133.91ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 201.1,
            "range": "± 2.58 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=201.1ns p75=203.67ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 111.8,
            "range": "± 2.96 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=111.8ns p75=114.76ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 180.57,
            "range": "± 1.94 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=180.57ns p75=182.52ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 72.62,
            "range": "± 6.19 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=72.62ns p75=78.81ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 224.93,
            "range": "± 1.99 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=224.93ns p75=226.92ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 352.28,
            "range": "± 4 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=352.28ns p75=356.28ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 280.39,
            "range": "± 1.7 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=280.39ns p75=282.08ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 214.3,
            "range": "± 0.65 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=214.3ns p75=214.95ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 545.86,
            "range": "± 3.71 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=545.86ns p75=549.57ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 242.05,
            "range": "± 0.78 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=242.05ns p75=242.83ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 267.41,
            "range": "± 1.17 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=267.41ns p75=268.57ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 572.09,
            "range": "± 3.41 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=572.09ns p75=575.5ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1225.05,
            "range": "± 6.39 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1225.05ns p75=1231.44ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 128.78,
            "range": "± 1.66 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=128.78ns p75=130.44ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 131.32,
            "range": "± 1.74 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=131.32ns p75=133.06ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 284.27,
            "range": "± 2.25 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=284.27ns p75=286.51ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 493.11,
            "range": "± 4.16 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=493.11ns p75=497.27ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 241.38,
            "range": "± 1.26 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=241.38ns p75=242.64ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 436.17,
            "range": "± 2.76 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=436.17ns p75=438.93ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 145.61,
            "range": "± 4.05 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=145.61ns p75=149.66ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 512.35,
            "range": "± 4.14 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=512.35ns p75=516.49ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 782.72,
            "range": "± 4.08 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=782.72ns p75=786.8ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 687.15,
            "range": "± 7.16 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=687.15ns p75=694.31ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 522.69,
            "range": "± 2.4 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=522.69ns p75=525.09ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1206.21,
            "range": "± 8.49 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1206.21ns p75=1214.7ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 541.89,
            "range": "± 3.89 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=541.89ns p75=545.78ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 668.24,
            "range": "± 5.42 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=668.24ns p75=673.66ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1451.69,
            "range": "± 8.59 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1451.69ns p75=1460.28ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2895.53,
            "range": "± 15.42 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2895.53ns p75=2910.95ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 293.98,
            "range": "± 2.6 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=293.98ns p75=296.58ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 296.81,
            "range": "± 2.49 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=296.81ns p75=299.3ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 717.59,
            "range": "± 7.52 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=717.59ns p75=725.1ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1150.93,
            "range": "± 11.92 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1150.93ns p75=1162.86ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 910.8,
            "range": "± 6.43 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=910.8ns p75=917.23ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1313.87,
            "range": "± 15.13 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1313.87ns p75=1329ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 967.17,
            "range": "± 4.79 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=967.17ns p75=971.96ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2300.15,
            "range": "± 18.2 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2300.15ns p75=2318.35ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2372.35,
            "range": "± 23.67 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2372.35ns p75=2396.02ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3609.49,
            "range": "± 30.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3609.49ns p75=3639.72ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2328.4,
            "range": "± 24.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2328.4ns p75=2353.07ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2692.77,
            "range": "± 28.4 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2692.77ns p75=2721.17ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1227.4,
            "range": "± 8.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1227.4ns p75=1235.84ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7202.83,
            "range": "± 94.41 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7202.83ns p75=7297.24ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6071.66,
            "range": "± 156.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6071.66ns p75=6228.32ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7538.86,
            "range": "± 64.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7538.86ns p75=7603.13ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 9873.3,
            "range": "± 53.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=9873.3ns p75=9927.19ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 91243.47,
            "range": "± 902.87 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=91243.47ns p75=92146.34ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 729.37,
            "range": "± 5.23 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=729.37ns p75=734.6ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1603.98,
            "range": "± 16.66 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1603.98ns p75=1620.64ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 9893.35,
            "range": "± 42.17 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=9893.35ns p75=9935.52ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 90836.06,
            "range": "± 328.77 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=90836.06ns p75=91164.83ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1407.73,
            "range": "± 13.26 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1407.73ns p75=1420.99ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4261.07,
            "range": "± 36.05 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4261.07ns p75=4297.12ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 31495.94,
            "range": "± 179.85 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=31495.94ns p75=31675.79ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 318656.51,
            "range": "± 631.36 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=318656.51ns p75=319287.87ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1313.06,
            "range": "± 18.61 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1313.06ns p75=1331.67ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1995.14,
            "range": "± 31.52 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1995.14ns p75=2026.67ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1436.57,
            "range": "± 9.65 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1436.57ns p75=1446.22ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 2040.47,
            "range": "± 48.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=2040.47ns p75=2088.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1386.07,
            "range": "± 12.01 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1386.07ns p75=1398.09ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3304.09,
            "range": "± 32.04 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3304.09ns p75=3336.13ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3578.55,
            "range": "± 30.78 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3578.55ns p75=3609.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4665.65,
            "range": "± 30.22 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4665.65ns p75=4695.87ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3228.67,
            "range": "± 28.86 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3228.67ns p75=3257.53ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4401.91,
            "range": "± 35.17 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4401.91ns p75=4437.07ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2237.66,
            "range": "± 25.36 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2237.66ns p75=2263.02ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8314.57,
            "range": "± 53.86 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8314.57ns p75=8368.43ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8240.74,
            "range": "± 52.94 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8240.74ns p75=8293.68ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10975.96,
            "range": "± 35.36 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10975.96ns p75=11011.32ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 10474.63,
            "range": "± 12.1 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=10474.63ns p75=10486.72ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 90541.13,
            "range": "± 606.94 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=90541.13ns p75=91148.07ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1114.02,
            "range": "± 9.11 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1114.02ns p75=1123.13ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1789.71,
            "range": "± 22.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1789.71ns p75=1812.09ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1286.53,
            "range": "± 16.8 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1286.53ns p75=1303.33ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1858.6,
            "range": "± 22.24 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1858.6ns p75=1880.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1236.06,
            "range": "± 15.13 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1236.06ns p75=1251.18ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3226.56,
            "range": "± 19.86 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3226.56ns p75=3246.42ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3510.88,
            "range": "± 69.12 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3510.88ns p75=3580ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4926.52,
            "range": "± 81.65 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4926.52ns p75=5008.17ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4101.36,
            "range": "± 41.52 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4101.36ns p75=4142.88ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1982.89,
            "range": "± 30.85 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1982.89ns p75=2013.74ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10741.26,
            "range": "± 26.97 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10741.26ns p75=10768.24ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 11633.46,
            "range": "± 55.19 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=11633.46ns p75=11688.65ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 100891.35,
            "range": "± 370.52 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=100891.35ns p75=101261.86ns mode=batch"
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
          "id": "1c4bef0b11da1fdfaee11da7a86112433ba13ad1",
          "message": "perf: replace parser guard array scans with direct traversal #163\n\nSplit `unwrapTransparent` into `unwrapGrouped` and `unwrapAllTransparent`, dropping the per-call kinds array and `includes` scans.\nRewrote `someDescendant` as a direct recursive switch, removing the `childNodes` generator and its per-step allocations.\nHoisted the deep-walker predicate closures to module level.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-01T17:47:50+03:00",
          "tree_id": "d170ffb9098cd4a5ed98ce0ffc72c8ffa38811c2",
          "url": "https://github.com/edloidas/roll-parser/commit/1c4bef0b11da1fdfaee11da7a86112433ba13ad1"
        },
        "date": 1785595870648,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 140.14,
            "range": "± 3.57 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=140.14ns p75=143.71ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 183.01,
            "range": "± 1.35 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=183.01ns p75=184.36ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 123.17,
            "range": "± 1.57 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=123.17ns p75=124.74ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 171.1,
            "range": "± 53.4 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=171.1ns p75=224.5ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 81.16,
            "range": "± 4.83 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=81.16ns p75=85.99ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 210.99,
            "range": "± 2 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=210.99ns p75=212.99ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 339.44,
            "range": "± 2.8 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=339.44ns p75=342.24ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 266.28,
            "range": "± 1.67 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=266.28ns p75=267.95ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 204.79,
            "range": "± 1.56 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=204.79ns p75=206.35ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 528.13,
            "range": "± 3.43 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=528.13ns p75=531.56ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 210.6,
            "range": "± 0.83 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=210.6ns p75=211.43ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 254.46,
            "range": "± 1.77 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=254.46ns p75=256.23ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 562.48,
            "range": "± 3.58 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=562.48ns p75=566.06ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1213.87,
            "range": "± 6.83 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1213.87ns p75=1220.69ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 137.45,
            "range": "± 1.92 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=137.45ns p75=139.37ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 141.19,
            "range": "± 0.83 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=141.19ns p75=142.02ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 258.02,
            "range": "± 1.67 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=258.02ns p75=259.69ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 370.12,
            "range": "± 3.17 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=370.12ns p75=373.29ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 226.16,
            "range": "± 0.86 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=226.16ns p75=227.02ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 339.85,
            "range": "± 2.5 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=339.85ns p75=342.35ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 150.24,
            "range": "± 0.96 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=150.24ns p75=151.19ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 391.14,
            "range": "± 1.92 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=391.14ns p75=393.06ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 643.23,
            "range": "± 3.87 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=643.23ns p75=647.1ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 523.76,
            "range": "± 2.89 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=523.76ns p75=526.65ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 398.93,
            "range": "± 1.89 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=398.93ns p75=400.82ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1116.59,
            "range": "± 6.99 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1116.59ns p75=1123.58ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 387.34,
            "range": "± 2.05 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=387.34ns p75=389.39ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 533.33,
            "range": "± 2.96 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=533.33ns p75=536.29ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1299.28,
            "range": "± 5.5 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1299.28ns p75=1304.78ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2656.95,
            "range": "± 14.9 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2656.95ns p75=2671.85ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 251.1,
            "range": "± 1.48 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=251.1ns p75=252.58ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 255.26,
            "range": "± 1.42 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=255.26ns p75=256.68ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 613.17,
            "range": "± 3.49 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=613.17ns p75=616.65ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1082.07,
            "range": "± 6.73 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1082.07ns p75=1088.81ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 814.57,
            "range": "± 11.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=814.57ns p75=826.14ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1203.52,
            "range": "± 6.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1203.52ns p75=1210.1ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 877.6,
            "range": "± 5.41 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=877.6ns p75=883.01ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2373.74,
            "range": "± 13.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2373.74ns p75=2386.97ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2397.26,
            "range": "± 28.92 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2397.26ns p75=2426.19ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3717.69,
            "range": "± 32.48 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3717.69ns p75=3750.17ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2350.8,
            "range": "± 18.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2350.8ns p75=2368.89ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2698.93,
            "range": "± 37.33 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2698.93ns p75=2736.26ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1218.51,
            "range": "± 7.59 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1218.51ns p75=1226.09ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7490.17,
            "range": "± 54.03 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7490.17ns p75=7544.2ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6264.79,
            "range": "± 94.1 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6264.79ns p75=6358.89ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7492.7,
            "range": "± 21.71 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7492.7ns p75=7514.41ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 10966.02,
            "range": "± 24.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=10966.02ns p75=10990.59ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 101258.83,
            "range": "± 215.33 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=101258.83ns p75=101474.16ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 656.75,
            "range": "± 6.77 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=656.75ns p75=663.52ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1743.8,
            "range": "± 5.91 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1743.8ns p75=1749.71ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 10947.8,
            "range": "± 25.1 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=10947.8ns p75=10972.9ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 100400.55,
            "range": "± 372.98 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=100400.55ns p75=100773.53ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1400.69,
            "range": "± 10.89 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1400.69ns p75=1411.58ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4510.6,
            "range": "± 16.88 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4510.6ns p75=4527.47ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 32671.37,
            "range": "± 84.7 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=32671.37ns p75=32756.08ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 340116.2,
            "range": "± 2032.9 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=340116.2ns p75=342149.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1281.43,
            "range": "± 50.72 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1281.43ns p75=1332.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1985.62,
            "range": "± 9.91 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1985.62ns p75=1995.53ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1437.42,
            "range": "± 5.86 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1437.42ns p75=1443.28ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 2030.78,
            "range": "± 7.66 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=2030.78ns p75=2038.44ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1369.15,
            "range": "± 7.65 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1369.15ns p75=1376.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3275.09,
            "range": "± 25.65 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3275.09ns p75=3300.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3481.11,
            "range": "± 27.69 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3481.11ns p75=3508.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4735.67,
            "range": "± 26.8 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4735.67ns p75=4762.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3228.31,
            "range": "± 10.37 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3228.31ns p75=3238.69ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4198,
            "range": "± 19.23 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4198ns p75=4217.22ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2257,
            "range": "± 29.62 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2257ns p75=2286.63ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8489.48,
            "range": "± 15.21 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8489.48ns p75=8504.69ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7904.01,
            "range": "± 54.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7904.01ns p75=7958.89ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 11033.85,
            "range": "± 455.52 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=11033.85ns p75=11489.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 11437.71,
            "range": "± 21.89 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=11437.71ns p75=11459.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 100216.04,
            "range": "± 234.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=100216.04ns p75=100450.5ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1113.33,
            "range": "± 9.43 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1113.33ns p75=1122.77ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1824.58,
            "range": "± 14.05 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1824.58ns p75=1838.63ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1309.74,
            "range": "± 18.3 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1309.74ns p75=1328.05ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1875.43,
            "range": "± 40.16 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1875.43ns p75=1915.59ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1244.8,
            "range": "± 7.7 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1244.8ns p75=1252.5ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3194.62,
            "range": "± 21.36 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3194.62ns p75=3215.99ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3407.15,
            "range": "± 29.31 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3407.15ns p75=3436.46ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 5091.84,
            "range": "± 77.03 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=5091.84ns p75=5168.87ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4024.14,
            "range": "± 16.41 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4024.14ns p75=4040.55ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2052.8,
            "range": "± 13.19 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2052.8ns p75=2065.99ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10701.47,
            "range": "± 27.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10701.47ns p75=10728.86ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 12703.18,
            "range": "± 10.14 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=12703.18ns p75=12713.32ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 111285.51,
            "range": "± 95.9 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=111285.51ns p75=111381.41ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "4591edd74771292d8d9d703e09ef1b15e18a90d4",
          "message": "test: fix false guarantees and weak assertions in the test suite #176\n\nRenamed `complexity.test.ts` to `draws.test.ts` and re-scoped its module doc and the `ci.yml` bench comment to RNG draw-consumption contracts, dropping the false complexity-gate claim.\nReworked `package-smoke.test.ts` to run the real `bun run build` in `beforeAll`, making the executable-bit assertion a genuine guard instead of a self-fulfilling `chmodSync` plus build-script text grep.\nConverted 58 silent or duplicated `try`/`catch` error assertions across the lexer, parser, evaluator, and testing suites to `expectRollError`.\nStrengthened the `floor`/`ceil`/`abs`/`max`/`min` property oracles to exact same-seed equalities, including pairwise dice equality between `max` and `min` calls.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-01T20:29:50+03:00",
          "tree_id": "102366c7af3d25b9b9da603a91e9e696d1274b0c",
          "url": "https://github.com/edloidas/roll-parser/commit/4591edd74771292d8d9d703e09ef1b15e18a90d4"
        },
        "date": 1785605597881,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 130.6,
            "range": "± 3.64 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=130.6ns p75=134.24ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 203.98,
            "range": "± 0.72 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=203.98ns p75=204.7ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 203.61,
            "range": "± 5.28 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=203.61ns p75=208.89ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 184.63,
            "range": "± 5.82 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=184.63ns p75=190.46ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 72.62,
            "range": "± 5.9 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=72.62ns p75=78.52ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 217.74,
            "range": "± 1.82 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=217.74ns p75=219.56ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 359.33,
            "range": "± 4.85 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=359.33ns p75=364.18ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 280.54,
            "range": "± 2.54 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=280.54ns p75=283.08ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 215.08,
            "range": "± 1.48 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=215.08ns p75=216.55ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 567.32,
            "range": "± 5.4 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=567.32ns p75=572.72ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 232.44,
            "range": "± 1.03 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=232.44ns p75=233.47ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 269.18,
            "range": "± 1.6 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=269.18ns p75=270.79ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 567.6,
            "range": "± 3.49 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=567.6ns p75=571.09ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1230.09,
            "range": "± 6.42 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1230.09ns p75=1236.52ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 128.26,
            "range": "± 1.51 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=128.26ns p75=129.77ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 131.28,
            "range": "± 1.23 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=131.28ns p75=132.51ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 277.53,
            "range": "± 1.7 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=277.53ns p75=279.22ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 486.26,
            "range": "± 2.69 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=486.26ns p75=488.95ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 236.73,
            "range": "± 0.68 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=236.73ns p75=237.41ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 432.5,
            "range": "± 1.67 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=432.5ns p75=434.17ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 154.07,
            "range": "± 4.07 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=154.07ns p75=158.14ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 482.51,
            "range": "± 1.63 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=482.51ns p75=484.14ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 736.57,
            "range": "± 2.52 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=736.57ns p75=739.09ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 651.24,
            "range": "± 3.12 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=651.24ns p75=654.35ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 499.95,
            "range": "± 2.6 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=499.95ns p75=502.55ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1149.43,
            "range": "± 9.1 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1149.43ns p75=1158.53ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 520.04,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=520.04ns p75=522.42ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 637.71,
            "range": "± 2.55 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=637.71ns p75=640.26ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1324.99,
            "range": "± 7.73 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1324.99ns p75=1332.73ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2720.61,
            "range": "± 15.32 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2720.61ns p75=2735.92ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 276.1,
            "range": "± 2.16 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=276.1ns p75=278.26ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 280.12,
            "range": "± 1.96 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=280.12ns p75=282.08ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 695.44,
            "range": "± 5.26 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=695.44ns p75=700.7ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1122.38,
            "range": "± 10.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1122.38ns p75=1133.32ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 870.73,
            "range": "± 6.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=870.73ns p75=876.96ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1246.72,
            "range": "± 8.45 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1246.72ns p75=1255.17ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 920.97,
            "range": "± 3.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=920.97ns p75=924.25ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2233.03,
            "range": "± 28.48 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2233.03ns p75=2261.5ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2198.43,
            "range": "± 31.81 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2198.43ns p75=2230.24ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3694,
            "range": "± 22.78 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3694ns p75=3716.78ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2272.25,
            "range": "± 12.3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2272.25ns p75=2284.55ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2592.52,
            "range": "± 21.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2592.52ns p75=2614.41ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1189.18,
            "range": "± 17.86 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1189.18ns p75=1207.04ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7341.34,
            "range": "± 100.45 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7341.34ns p75=7441.79ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5857.24,
            "range": "± 88.62 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5857.24ns p75=5945.86ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7154.04,
            "range": "± 26.63 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7154.04ns p75=7180.66ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 9868.33,
            "range": "± 106.48 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=9868.33ns p75=9974.81ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 92376.19,
            "range": "± 662.43 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=92376.19ns p75=93038.62ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 713.21,
            "range": "± 7.53 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=713.21ns p75=720.74ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1660.9,
            "range": "± 14.05 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1660.9ns p75=1674.95ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 9993.29,
            "range": "± 31.41 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=9993.29ns p75=10024.7ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 91360.76,
            "range": "± 806.99 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=91360.76ns p75=92167.75ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1383.65,
            "range": "± 8.36 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1383.65ns p75=1392.01ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4453.7,
            "range": "± 14.32 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4453.7ns p75=4468.02ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 31518.22,
            "range": "± 138.09 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=31518.22ns p75=31656.31ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 317944.17,
            "range": "± 629.22 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=317944.17ns p75=318573.39ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1233.65,
            "range": "± 43.03 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1233.65ns p75=1276.67ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1917.29,
            "range": "± 9.28 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1917.29ns p75=1926.57ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1374.81,
            "range": "± 6.42 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1374.81ns p75=1381.22ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1952.62,
            "range": "± 11.25 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1952.62ns p75=1963.87ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1328.45,
            "range": "± 13.58 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1328.45ns p75=1342.03ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3190.06,
            "range": "± 14.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3190.06ns p75=3204.94ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3451.16,
            "range": "± 26.62 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3451.16ns p75=3477.78ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4663.27,
            "range": "± 14.57 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4663.27ns p75=4677.83ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3163.29,
            "range": "± 11.64 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3163.29ns p75=3174.93ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4126.03,
            "range": "± 44.56 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4126.03ns p75=4170.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2152.36,
            "range": "± 26.63 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2152.36ns p75=2179ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8597.09,
            "range": "± 27.6 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8597.09ns p75=8624.69ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8203.76,
            "range": "± 45.22 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8203.76ns p75=8248.98ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10584.7,
            "range": "± 34.18 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10584.7ns p75=10618.88ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 10598.54,
            "range": "± 43.89 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=10598.54ns p75=10642.43ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 91954.66,
            "range": "± 139.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=91954.66ns p75=92093.79ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1093,
            "range": "± 18.3 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1093ns p75=1111.3ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1756.38,
            "range": "± 13.46 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1756.38ns p75=1769.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1264.76,
            "range": "± 10.12 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1264.76ns p75=1274.88ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1825.32,
            "range": "± 19.06 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1825.32ns p75=1844.37ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1198.11,
            "range": "± 9.7 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1198.11ns p75=1207.81ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3142.65,
            "range": "± 31.21 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3142.65ns p75=3173.86ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3316.45,
            "range": "± 40.96 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3316.45ns p75=3357.41ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4912.59,
            "range": "± 41.45 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4912.59ns p75=4954.05ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4010.79,
            "range": "± 29.65 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4010.79ns p75=4040.44ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1937.32,
            "range": "± 26.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1937.32ns p75=1963.71ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10155.15,
            "range": "± 27.29 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10155.15ns p75=10182.45ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 11635.74,
            "range": "± 34.91 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=11635.74ns p75=11670.65ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 101920.08,
            "range": "± 210.51 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=101920.08ns p75=102130.59ns mode=batch"
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
          "id": "8bbb9b5ba2d15b180e748499412b225e099898dc",
          "message": "ci: key PR concurrency group on PR number #158\n\nKeyed the concurrency group on `github.event.pull_request.number` for PR events, so fork PRs with identical branch names no longer share a group and cancel each other's runs.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-01T21:44:51+03:00",
          "tree_id": "bb8641d49f4ae34a2556c12e557fe3326858197c",
          "url": "https://github.com/edloidas/roll-parser/commit/8bbb9b5ba2d15b180e748499412b225e099898dc"
        },
        "date": 1785610091692,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 129.8,
            "range": "± 4.36 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=129.8ns p75=134.16ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 198.44,
            "range": "± 1.94 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=198.44ns p75=200.37ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 111.43,
            "range": "± 1.98 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=111.43ns p75=113.41ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 179.72,
            "range": "± 2.22 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=179.72ns p75=181.94ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 72.49,
            "range": "± 5.03 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=72.49ns p75=77.52ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 220.72,
            "range": "± 1.8 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=220.72ns p75=222.53ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 352.79,
            "range": "± 2.96 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=352.79ns p75=355.75ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 281.96,
            "range": "± 4.88 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=281.96ns p75=286.84ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 215.36,
            "range": "± 2.1 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=215.36ns p75=217.45ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 549.1,
            "range": "± 3.17 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=549.1ns p75=552.27ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 227.77,
            "range": "± 2.12 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=227.77ns p75=229.89ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 267.36,
            "range": "± 2.13 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=267.36ns p75=269.48ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 559.5,
            "range": "± 3.24 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=559.5ns p75=562.74ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1193.95,
            "range": "± 8.98 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1193.95ns p75=1202.93ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 127.05,
            "range": "± 0.65 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=127.05ns p75=127.7ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 129.71,
            "range": "± 0.79 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=129.71ns p75=130.49ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 279.75,
            "range": "± 3.15 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=279.75ns p75=282.9ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 464.94,
            "range": "± 2.19 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=464.94ns p75=467.13ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 224.36,
            "range": "± 1.76 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=224.36ns p75=226.12ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 412.71,
            "range": "± 1.56 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=412.71ns p75=414.27ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 141.09,
            "range": "± 4.81 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=141.09ns p75=145.9ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 489.78,
            "range": "± 2.52 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=489.78ns p75=492.3ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 736.94,
            "range": "± 3.66 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=736.94ns p75=740.61ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 645.15,
            "range": "± 4.28 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=645.15ns p75=649.43ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 478.9,
            "range": "± 2.36 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=478.9ns p75=481.27ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1109.94,
            "range": "± 7.12 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1109.94ns p75=1117.07ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 529.28,
            "range": "± 2.73 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=529.28ns p75=532.01ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 637.33,
            "range": "± 2.55 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=637.33ns p75=639.88ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1301.44,
            "range": "± 5.22 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1301.44ns p75=1306.66ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2706.96,
            "range": "± 15.99 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2706.96ns p75=2722.95ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 281.83,
            "range": "± 2.49 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=281.83ns p75=284.32ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 285.84,
            "range": "± 2.73 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=285.84ns p75=288.57ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 663.65,
            "range": "± 5.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=663.65ns p75=669.42ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1077,
            "range": "± 5.47 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1077ns p75=1082.47ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 822.96,
            "range": "± 2.52 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=822.96ns p75=825.48ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1185.99,
            "range": "± 3.6 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1185.99ns p75=1189.59ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 860.08,
            "range": "± 2.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=860.08ns p75=862.85ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2103.14,
            "range": "± 14.62 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2103.14ns p75=2117.76ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2141.03,
            "range": "± 16.14 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2141.03ns p75=2157.17ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3321.56,
            "range": "± 37.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3321.56ns p75=3358.75ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2136.61,
            "range": "± 10.75 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2136.61ns p75=2147.36ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2598.88,
            "range": "± 19.5 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2598.88ns p75=2618.38ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1245.61,
            "range": "± 5.98 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1245.61ns p75=1251.59ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6791.98,
            "range": "± 68.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6791.98ns p75=6860.87ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5647.46,
            "range": "± 94 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5647.46ns p75=5741.45ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 6950.52,
            "range": "± 25.15 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=6950.52ns p75=6975.67ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8518.4,
            "range": "± 33.99 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8518.4ns p75=8552.4ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 77380.32,
            "range": "± 276.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=77380.32ns p75=77657.26ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 680.36,
            "range": "± 4.99 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=680.36ns p75=685.35ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1529.64,
            "range": "± 10.45 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1529.64ns p75=1540.1ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8548.94,
            "range": "± 44.72 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8548.94ns p75=8593.66ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 77243.64,
            "range": "± 396.45 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=77243.64ns p75=77640.09ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1336.11,
            "range": "± 10.9 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1336.11ns p75=1347.01ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4090.11,
            "range": "± 47.43 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4090.11ns p75=4137.54ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 28821.39,
            "range": "± 221.78 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=28821.39ns p75=29043.16ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 293985.42,
            "range": "± 591.31 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=293985.42ns p75=294576.73ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1232.22,
            "range": "± 38.19 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1232.22ns p75=1270.41ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1872.67,
            "range": "± 10.45 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1872.67ns p75=1883.12ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1334.9,
            "range": "± 9.52 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1334.9ns p75=1344.42ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1878.47,
            "range": "± 10.2 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1878.47ns p75=1888.67ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1254.12,
            "range": "± 18.78 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1254.12ns p75=1272.91ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3024.19,
            "range": "± 24.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3024.19ns p75=3048.86ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3339.64,
            "range": "± 20.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3339.64ns p75=3360.57ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4307.06,
            "range": "± 20.43 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4307.06ns p75=4327.49ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2962.71,
            "range": "± 19.72 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2962.71ns p75=2982.43ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4012.85,
            "range": "± 25.48 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4012.85ns p75=4038.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2063.09,
            "range": "± 27.86 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2063.09ns p75=2090.95ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 7908.34,
            "range": "± 46.16 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=7908.34ns p75=7954.5ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7609.49,
            "range": "± 96.5 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7609.49ns p75=7705.99ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10358.86,
            "range": "± 24.24 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10358.86ns p75=10383.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9172.51,
            "range": "± 25.68 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9172.51ns p75=9198.19ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 77642.71,
            "range": "± 102.51 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=77642.71ns p75=77745.22ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1061.98,
            "range": "± 9.35 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1061.98ns p75=1071.33ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1691.24,
            "range": "± 11.36 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1691.24ns p75=1702.6ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1203.27,
            "range": "± 10.55 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1203.27ns p75=1213.83ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1706.88,
            "range": "± 7.18 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1706.88ns p75=1714.06ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1127.48,
            "range": "± 8.78 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1127.48ns p75=1136.26ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2894.37,
            "range": "± 17.89 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2894.37ns p75=2912.25ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3214.09,
            "range": "± 36.63 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3214.09ns p75=3250.72ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4571.05,
            "range": "± 57.91 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4571.05ns p75=4628.97ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3813.13,
            "range": "± 66.36 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3813.13ns p75=3879.49ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1893.83,
            "range": "± 15.4 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1893.83ns p75=1909.23ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10068.67,
            "range": "± 26.34 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10068.67ns p75=10095.01ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10237.22,
            "range": "± 48.21 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10237.22ns p75=10285.43ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 87126.84,
            "range": "± 307.88 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=87126.84ns p75=87434.72ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "2a10cbea0b8f31966666fc44a0a0cfd00e738624",
          "message": "test: add an automated README example runner #161\n\nAdded `src/readme.test.ts`, executing every `typescript` fenced block in README.md and MIGRATION.md against the built package and asserting the outputs claimed by `expr; // <literal>` comments, with `throws` and next-line-comment conventions and a `<!-- readme-test: skip -->` opt-out.\nExtracted the dist rebuild into a memoized `ensureFreshDist()` in `src/test-helpers.ts`, shared with `package-smoke.test.ts` so one build serves the whole test run.\nAdded a `buildDist()` failure-path test and drained both spawn pipes to avoid blocking the child and to capture `tsc` diagnostics from stdout.\nMarked the two MIGRATION.md blocks showing the removed v2 API with the skip marker.\nIgnored `dist/**` in Bun coverage so the in-process import of the built package does not distort the thresholds.\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-08-01T22:12:44+03:00",
          "tree_id": "f51c5c7c630469f77743b01bdfcf159f9a98bec8",
          "url": "https://github.com/edloidas/roll-parser/commit/2a10cbea0b8f31966666fc44a0a0cfd00e738624"
        },
        "date": 1785611757769,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 131.01,
            "range": "± 6 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=131.01ns p75=137.01ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 204.24,
            "range": "± 125.29 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=204.24ns p75=329.53ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 112.52,
            "range": "± 1.24 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=112.52ns p75=113.76ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 183.61,
            "range": "± 1.39 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=183.61ns p75=185ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 73.14,
            "range": "± 5.71 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=73.14ns p75=78.86ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 223.75,
            "range": "± 1.54 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=223.75ns p75=225.28ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 358.13,
            "range": "± 2.09 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=358.13ns p75=360.22ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 282.92,
            "range": "± 2.43 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=282.92ns p75=285.35ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 217.89,
            "range": "± 1.35 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=217.89ns p75=219.24ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 561.38,
            "range": "± 2.71 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=561.38ns p75=564.08ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 231.7,
            "range": "± 1.2 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=231.7ns p75=232.89ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 278.93,
            "range": "± 2.4 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=278.93ns p75=281.33ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 568.46,
            "range": "± 2.55 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=568.46ns p75=571.01ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1227.74,
            "range": "± 9.85 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1227.74ns p75=1237.59ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 130.37,
            "range": "± 0.62 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=130.37ns p75=130.98ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 134.99,
            "range": "± 0.56 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=134.99ns p75=135.55ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 282.64,
            "range": "± 3.38 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=282.64ns p75=286.02ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 466.51,
            "range": "± 2.53 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=466.51ns p75=469.04ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 234.57,
            "range": "± 1.22 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=234.57ns p75=235.79ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 418.14,
            "range": "± 2.19 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=418.14ns p75=420.34ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 148.44,
            "range": "± 4.04 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=148.44ns p75=152.48ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 474.79,
            "range": "± 2.09 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=474.79ns p75=476.88ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 724.37,
            "range": "± 3.23 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=724.37ns p75=727.6ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 633.04,
            "range": "± 2.65 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=633.04ns p75=635.7ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 487.33,
            "range": "± 4.38 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=487.33ns p75=491.71ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1105.21,
            "range": "± 8.96 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1105.21ns p75=1114.17ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 519.35,
            "range": "± 3.09 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=519.35ns p75=522.44ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 614.82,
            "range": "± 3.49 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=614.82ns p75=618.31ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1279.23,
            "range": "± 9.28 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1279.23ns p75=1288.51ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2736.08,
            "range": "± 15.7 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2736.08ns p75=2751.79ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 268.58,
            "range": "± 2.02 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=268.58ns p75=270.59ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 272.1,
            "range": "± 1.58 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=272.1ns p75=273.67ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 678.85,
            "range": "± 5.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=678.85ns p75=684.42ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1082.9,
            "range": "± 6.52 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1082.9ns p75=1089.42ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 823.12,
            "range": "± 4.35 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=823.12ns p75=827.47ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1174.48,
            "range": "± 7.56 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1174.48ns p75=1182.04ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 875.09,
            "range": "± 5.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=875.09ns p75=880.32ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2151.29,
            "range": "± 16.83 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2151.29ns p75=2168.12ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2144.5,
            "range": "± 19.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2144.5ns p75=2163.78ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3399.65,
            "range": "± 21.58 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3399.65ns p75=3421.23ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2162.84,
            "range": "± 10.16 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2162.84ns p75=2172.99ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2623.66,
            "range": "± 30.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2623.66ns p75=2654.6ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1177.39,
            "range": "± 6.6 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1177.39ns p75=1183.99ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6912.73,
            "range": "± 73.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6912.73ns p75=6986.01ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5927.48,
            "range": "± 59.84 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5927.48ns p75=5987.32ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7272.46,
            "range": "± 19.46 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7272.46ns p75=7291.92ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8818.84,
            "range": "± 22.39 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8818.84ns p75=8841.23ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 79820.93,
            "range": "± 497.1 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=79820.93ns p75=80318.03ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 685.46,
            "range": "± 5.68 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=685.46ns p75=691.15ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1545.29,
            "range": "± 9.13 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1545.29ns p75=1554.42ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8802.18,
            "range": "± 33.15 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8802.18ns p75=8835.33ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 79084.79,
            "range": "± 599.85 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=79084.79ns p75=79684.65ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1315.58,
            "range": "± 8.02 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1315.58ns p75=1323.6ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4112.93,
            "range": "± 28.01 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4112.93ns p75=4140.94ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 29406.16,
            "range": "± 101.85 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=29406.16ns p75=29508.01ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 294594.44,
            "range": "± 1666.74 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=294594.44ns p75=296261.18ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1212,
            "range": "± 9.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1212ns p75=1221.41ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1868.88,
            "range": "± 12.23 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1868.88ns p75=1881.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1331.67,
            "range": "± 5.08 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1331.67ns p75=1336.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1920.55,
            "range": "± 18.12 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1920.55ns p75=1938.67ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1261.83,
            "range": "± 9.54 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1261.83ns p75=1271.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3066.95,
            "range": "± 21.66 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3066.95ns p75=3088.61ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3348.82,
            "range": "± 20.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3348.82ns p75=3369.61ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4383.41,
            "range": "± 16.8 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4383.41ns p75=4400.21ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3037.37,
            "range": "± 12.94 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3037.37ns p75=3050.31ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4159.04,
            "range": "± 48.59 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4159.04ns p75=4207.63ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2125.49,
            "range": "± 35.09 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2125.49ns p75=2160.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 7920.6,
            "range": "± 36.25 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=7920.6ns p75=7956.84ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7955.7,
            "range": "± 35.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7955.7ns p75=7991.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10597.85,
            "range": "± 32.85 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10597.85ns p75=10630.7ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9312.98,
            "range": "± 24.14 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9312.98ns p75=9337.11ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 79438.25,
            "range": "± 317.5 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=79438.25ns p75=79755.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1048.81,
            "range": "± 10.29 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1048.81ns p75=1059.1ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1740.83,
            "range": "± 11.77 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1740.83ns p75=1752.6ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1192.8,
            "range": "± 5.29 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1192.8ns p75=1198.09ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1776.85,
            "range": "± 9.05 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1776.85ns p75=1785.91ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1141.2,
            "range": "± 8.26 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1141.2ns p75=1149.47ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2960.67,
            "range": "± 10.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2960.67ns p75=2971.05ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3289.3,
            "range": "± 34.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3289.3ns p75=3323.58ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4629.19,
            "range": "± 21.1 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4629.19ns p75=4650.29ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3910.98,
            "range": "± 36.89 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3910.98ns p75=3947.87ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1940.29,
            "range": "± 14.35 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1940.29ns p75=1954.64ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10139.72,
            "range": "± 42.87 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10139.72ns p75=10182.6ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10356.46,
            "range": "± 9.41 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10356.46ns p75=10365.87ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 88694.59,
            "range": "± 102.69 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=88694.59ns p75=88797.27ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "8380f9fcf8363564a314e77abb8a7246ed862898",
          "message": "fix: stop escaping doc-test assertions into generated code #185\n\nReplaced the `JSON.stringify`-escaped assertion arguments in generated block code with a per-block `DocCase[]` table that `__assert`/`__throws` index into, removing the dataflow CodeQL flagged as `js/bad-code-sanitization`.\nAdded `lookupCase()` to resolve a case by index and validate its kind, so an index misalignment fails loudly instead of asserting against the wrong expectation.\nReplaced `CompiledBlock.assertions` with `cases`, which the corpus floor test now counts.\nAdded a synthetic block mixing value and `throws` assertions, pinning the compile-time case indices to the ones the generated code looks up at runtime.\n\nCo-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-08-01T22:36:06+03:00",
          "tree_id": "f62a46a9096ad0504e68ff36976c4c93cc690a62",
          "url": "https://github.com/edloidas/roll-parser/commit/8380f9fcf8363564a314e77abb8a7246ed862898"
        },
        "date": 1785613162464,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 108.29,
            "range": "± 3.8 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=108.29ns p75=112.09ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 171.3,
            "range": "± 4.21 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=171.3ns p75=175.51ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 91.02,
            "range": "± 3.62 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=91.02ns p75=94.64ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 153.15,
            "range": "± 3.66 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=153.15ns p75=156.8ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 60.98,
            "range": "± 4 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=60.98ns p75=64.98ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 184.52,
            "range": "± 4.87 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=184.52ns p75=189.39ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 296.1,
            "range": "± 6.56 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=296.1ns p75=302.66ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 242.84,
            "range": "± 5.47 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=242.84ns p75=248.3ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 183.34,
            "range": "± 4.08 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=183.34ns p75=187.42ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 484.91,
            "range": "± 8.96 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=484.91ns p75=493.87ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 194.37,
            "range": "± 3.24 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=194.37ns p75=197.61ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 223.5,
            "range": "± 4.77 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=223.5ns p75=228.27ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 482.37,
            "range": "± 9.82 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=482.37ns p75=492.19ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1027.6,
            "range": "± 17.74 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1027.6ns p75=1045.34ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 104.22,
            "range": "± 3.26 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=104.22ns p75=107.48ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 106.61,
            "range": "± 3.35 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=106.61ns p75=109.96ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 234.33,
            "range": "± 5.89 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=234.33ns p75=240.22ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 385.92,
            "range": "± 9.06 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=385.92ns p75=394.98ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 203.03,
            "range": "± 4.34 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=203.03ns p75=207.37ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 352.41,
            "range": "± 6.45 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=352.41ns p75=358.85ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 119.94,
            "range": "± 3.74 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=119.94ns p75=123.68ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 408.03,
            "range": "± 7.76 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=408.03ns p75=415.78ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 608.53,
            "range": "± 12.74 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=608.53ns p75=621.27ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 539.07,
            "range": "± 10.28 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=539.07ns p75=549.35ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 405.67,
            "range": "± 9.45 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=405.67ns p75=415.12ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 934.39,
            "range": "± 18.58 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=934.39ns p75=952.98ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 415.42,
            "range": "± 7.91 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=415.42ns p75=423.33ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 511.52,
            "range": "± 8.42 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=511.52ns p75=519.94ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1117.56,
            "range": "± 19.1 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1117.56ns p75=1136.65ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2283.3,
            "range": "± 22.42 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2283.3ns p75=2305.72ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 231.04,
            "range": "± 5.33 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=231.04ns p75=236.37ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 235.44,
            "range": "± 4.4 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=235.44ns p75=239.84ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 546.55,
            "range": "± 10.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=546.55ns p75=557.44ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 891.26,
            "range": "± 11.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=891.26ns p75=902.94ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 705.53,
            "range": "± 13.22 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=705.53ns p75=718.75ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 995.42,
            "range": "± 10.35 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=995.42ns p75=1005.77ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 758.12,
            "range": "± 14.75 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=758.12ns p75=772.86ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1818.45,
            "range": "± 23.8 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1818.45ns p75=1842.25ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1812.96,
            "range": "± 28.11 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1812.96ns p75=1841.07ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3181.84,
            "range": "± 29.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3181.84ns p75=3211.42ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1899.19,
            "range": "± 24.75 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1899.19ns p75=1923.94ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2243.4,
            "range": "± 33.69 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2243.4ns p75=2277.08ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 963.58,
            "range": "± 9.49 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=963.58ns p75=973.06ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6476.16,
            "range": "± 69.35 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6476.16ns p75=6545.51ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 4707.07,
            "range": "± 59.08 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=4707.07ns p75=4766.15ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 6199.06,
            "range": "± 35.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=6199.06ns p75=6234.24ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 7829.73,
            "range": "± 57.54 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=7829.73ns p75=7887.27ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 71896.77,
            "range": "± 804.07 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=71896.77ns p75=72700.84ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 579.33,
            "range": "± 10.63 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=579.33ns p75=589.96ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1344.96,
            "range": "± 16.48 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1344.96ns p75=1361.44ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 7740.66,
            "range": "± 62.18 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=7740.66ns p75=7802.84ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 71809.89,
            "range": "± 227.46 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=71809.89ns p75=72037.34ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1073.85,
            "range": "± 17.91 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1073.85ns p75=1091.75ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3786.56,
            "range": "± 24.96 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3786.56ns p75=3811.52ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 26473.48,
            "range": "± 150.77 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=26473.48ns p75=26624.25ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 294616.15,
            "range": "± 1457.57 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=294616.15ns p75=296073.72ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1045.75,
            "range": "± 19.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1045.75ns p75=1065.54ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1678.64,
            "range": "± 22.69 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1678.64ns p75=1701.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1144.74,
            "range": "± 16.58 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1144.74ns p75=1161.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1709.31,
            "range": "± 18.38 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1709.31ns p75=1727.69ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1077.02,
            "range": "± 14.97 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1077.02ns p75=1091.99ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2645.37,
            "range": "± 26.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2645.37ns p75=2672.25ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 2867.42,
            "range": "± 15.53 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=2867.42ns p75=2882.96ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4126.83,
            "range": "± 41.12 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4126.83ns p75=4167.94ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2704.61,
            "range": "± 32.72 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2704.61ns p75=2737.32ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3633.74,
            "range": "± 42.34 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3633.74ns p75=3676.08ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1924.38,
            "range": "± 25.64 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1924.38ns p75=1950.03ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 7447.54,
            "range": "± 96.84 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=7447.54ns p75=7544.38ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 6212.34,
            "range": "± 51.83 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=6212.34ns p75=6264.17ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 9646.61,
            "range": "± 54.65 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=9646.61ns p75=9701.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 8623.74,
            "range": "± 52.78 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=8623.74ns p75=8676.53ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 74603.22,
            "range": "± 484.31 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=74603.22ns p75=75087.53ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 845.73,
            "range": "± 16.33 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=845.73ns p75=862.06ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1480.07,
            "range": "± 25.79 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1480.07ns p75=1505.87ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1015.47,
            "range": "± 15.16 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1015.47ns p75=1030.63ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1543.73,
            "range": "± 21.63 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1543.73ns p75=1565.36ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 961.67,
            "range": "± 20.63 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=961.67ns p75=982.3ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2585.55,
            "range": "± 27.31 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2585.55ns p75=2612.86ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 2767.62,
            "range": "± 21.93 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=2767.62ns p75=2789.55ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4517.84,
            "range": "± 45.01 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4517.84ns p75=4562.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3498.61,
            "range": "± 44.71 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3498.61ns p75=3543.32ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1726.94,
            "range": "± 17.02 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1726.94ns p75=1743.97ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 9780.38,
            "range": "± 61.57 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=9780.38ns p75=9841.94ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10406.11,
            "range": "± 44.76 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10406.11ns p75=10450.86ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 92426.23,
            "range": "± 314.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=92426.23ns p75=92740.5ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "0c6b5b98c77dda2cb927a233828e9ff3ca0a38a4",
          "message": "test: execute the browser smoke bundle in a real browser #160\n\nAdded `scripts/browser-smoke` workspace isolating the `playwright` dependency from the root tree, following the `scripts/docs` nesting pattern.\nImplemented `run.ts` harness serving the bundle as a module script over local HTTP and executing it in headless Chromium, failing on any `pageerror`, console error, unhandled rejection, or navigation hang, and passing only when the fixture's success log appears within a timeout.\nAdded `browser-run` CI job gated to default-branch pushes and manual dispatches, consuming the exact bundle the `browser-smoke` grep cleared via a new artifact and caching Playwright browsers keyed on the resolved version.\nExtended the release `smoke` job with the same Chromium execution against the release tarball's bundle, kept out of the credentialed `publish` path.\nVerified the negative case with a `process.version` probe — `process.env` reads are neutralized by esbuild's automatic `NODE_ENV` define under `--platform=browser --minify`.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-01T23:18:54+03:00",
          "tree_id": "adfa7433bdcf27ff31bf412d521c7a4a402fb6a3",
          "url": "https://github.com/edloidas/roll-parser/commit/0c6b5b98c77dda2cb927a233828e9ff3ca0a38a4"
        },
        "date": 1785615730599,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 129.95,
            "range": "± 4.52 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=129.95ns p75=134.46ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 196.46,
            "range": "± 1.85 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=196.46ns p75=198.31ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 112.31,
            "range": "± 2.8 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=112.31ns p75=115.11ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 214.21,
            "range": "± 127.85 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=214.21ns p75=342.06ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 74.14,
            "range": "± 6.28 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=74.14ns p75=80.42ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 218.5,
            "range": "± 2.21 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=218.5ns p75=220.71ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 351.54,
            "range": "± 2.78 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=351.54ns p75=354.31ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 278.13,
            "range": "± 3.02 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=278.13ns p75=281.15ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 210.12,
            "range": "± 2.85 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=210.12ns p75=212.97ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 549.38,
            "range": "± 4.7 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=549.38ns p75=554.07ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 227.27,
            "range": "± 2.07 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=227.27ns p75=229.34ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 264.53,
            "range": "± 3.04 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=264.53ns p75=267.57ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 566.02,
            "range": "± 3.25 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=566.02ns p75=569.27ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1189.42,
            "range": "± 8.53 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1189.42ns p75=1197.95ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 127.78,
            "range": "± 2.41 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=127.78ns p75=130.19ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 132.72,
            "range": "± 0.85 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=132.72ns p75=133.58ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 285.48,
            "range": "± 2.19 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=285.48ns p75=287.67ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 463.82,
            "range": "± 2.36 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=463.82ns p75=466.17ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 224.78,
            "range": "± 1.22 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=224.78ns p75=225.99ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 409.04,
            "range": "± 2.51 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=409.04ns p75=411.56ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 142.75,
            "range": "± 1.1 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=142.75ns p75=143.85ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 473.72,
            "range": "± 1.94 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=473.72ns p75=475.67ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 723.68,
            "range": "± 3.05 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=723.68ns p75=726.74ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 635.03,
            "range": "± 4.65 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=635.03ns p75=639.67ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 469.49,
            "range": "± 3.06 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=469.49ns p75=472.55ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1105.65,
            "range": "± 7.1 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1105.65ns p75=1112.74ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 508.48,
            "range": "± 2.72 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=508.48ns p75=511.2ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 608.23,
            "range": "± 2.9 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=608.23ns p75=611.13ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1290.37,
            "range": "± 9.16 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1290.37ns p75=1299.53ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2733.69,
            "range": "± 23.86 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2733.69ns p75=2757.55ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 274.06,
            "range": "± 2.42 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=274.06ns p75=276.47ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 276.99,
            "range": "± 2.46 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=276.99ns p75=279.45ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 666.03,
            "range": "± 6.25 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=666.03ns p75=672.28ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1058,
            "range": "± 7.58 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1058ns p75=1065.58ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 822.33,
            "range": "± 3.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=822.33ns p75=826.1ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1163.08,
            "range": "± 6.61 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1163.08ns p75=1169.69ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 857.86,
            "range": "± 4.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=857.86ns p75=862.6ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2092.16,
            "range": "± 19.7 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2092.16ns p75=2111.87ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2111.74,
            "range": "± 23.22 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2111.74ns p75=2134.97ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3380.26,
            "range": "± 33.6 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3380.26ns p75=3413.86ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2073.28,
            "range": "± 15.71 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2073.28ns p75=2088.99ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2528.68,
            "range": "± 21.75 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2528.68ns p75=2550.43ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1153.53,
            "range": "± 9.04 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1153.53ns p75=1162.57ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6788.78,
            "range": "± 32.16 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6788.78ns p75=6820.94ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5702.99,
            "range": "± 66.19 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5702.99ns p75=5769.18ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7135.06,
            "range": "± 24.82 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7135.06ns p75=7159.88ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8618.06,
            "range": "± 67.92 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8618.06ns p75=8685.99ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 78467.42,
            "range": "± 218.78 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=78467.42ns p75=78686.21ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 679.53,
            "range": "± 6.78 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=679.53ns p75=686.31ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1539.69,
            "range": "± 23.87 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1539.69ns p75=1563.56ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8711.4,
            "range": "± 36.71 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8711.4ns p75=8748.12ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 78409.82,
            "range": "± 158.28 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=78409.82ns p75=78568.1ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1295.88,
            "range": "± 12.28 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1295.88ns p75=1308.17ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4084.77,
            "range": "± 24.99 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4084.77ns p75=4109.77ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 28537.34,
            "range": "± 288.81 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=28537.34ns p75=28826.14ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 291863.87,
            "range": "± 977.65 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=291863.87ns p75=292841.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1204.94,
            "range": "± 18.95 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1204.94ns p75=1223.89ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1822.79,
            "range": "± 14.75 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1822.79ns p75=1837.55ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1323.67,
            "range": "± 10.66 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1323.67ns p75=1334.34ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1854.7,
            "range": "± 15.44 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1854.7ns p75=1870.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1252.51,
            "range": "± 13.73 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1252.51ns p75=1266.24ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3085.27,
            "range": "± 28.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3085.27ns p75=3114.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3390.29,
            "range": "± 24.15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3390.29ns p75=3414.44ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4331.6,
            "range": "± 39.77 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4331.6ns p75=4371.38ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2940.03,
            "range": "± 29.4 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2940.03ns p75=2969.43ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4043.21,
            "range": "± 43.8 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4043.21ns p75=4087.01ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2072.59,
            "range": "± 35.66 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2072.59ns p75=2108.25ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 7930.18,
            "range": "± 30.51 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=7930.18ns p75=7960.68ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7677.2,
            "range": "± 50.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7677.2ns p75=7727.32ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10543.08,
            "range": "± 26.5 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10543.08ns p75=10569.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9238.79,
            "range": "± 35.94 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9238.79ns p75=9274.72ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 78260.85,
            "range": "± 132.24 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=78260.85ns p75=78393.09ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1033.41,
            "range": "± 12.36 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1033.41ns p75=1045.77ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1666.33,
            "range": "± 21.09 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1666.33ns p75=1687.41ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1178.66,
            "range": "± 9.59 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1178.66ns p75=1188.25ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1711.97,
            "range": "± 9.91 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1711.97ns p75=1721.89ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1129.92,
            "range": "± 10.21 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1129.92ns p75=1140.13ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2928.01,
            "range": "± 25.03 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2928.01ns p75=2953.03ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3216.07,
            "range": "± 51.48 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3216.07ns p75=3267.55ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4607,
            "range": "± 40.32 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4607ns p75=4647.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3862.15,
            "range": "± 40.74 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3862.15ns p75=3902.89ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1877.84,
            "range": "± 25.21 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1877.84ns p75=1903.05ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10262.29,
            "range": "± 13.71 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10262.29ns p75=10276.01ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10303.09,
            "range": "± 47.71 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10303.09ns p75=10350.8ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 88324.76,
            "range": "± 484.38 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=88324.76ns p75=88809.14ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "374b4915fb868bc107a79202c549a5b4bf78b8fe",
          "message": "chore: bump the npm-development group with 2 updates\n\nBumps the npm-development group with 2 updates: [@size-limit/preset-small-lib](https://github.com/ai/size-limit) and [size-limit](https://github.com/ai/size-limit).\n\n\nUpdates `@size-limit/preset-small-lib` from 13.0.1 to 13.0.2\n- [Release notes](https://github.com/ai/size-limit/releases)\n- [Changelog](https://github.com/ai/size-limit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/ai/size-limit/compare/13.0.1...13.0.2)\n\nUpdates `size-limit` from 13.0.1 to 13.0.2\n- [Release notes](https://github.com/ai/size-limit/releases)\n- [Changelog](https://github.com/ai/size-limit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/ai/size-limit/compare/13.0.1...13.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: \"@size-limit/preset-small-lib\"\n  dependency-version: 13.0.2\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n  dependency-group: npm-development\n- dependency-name: size-limit\n  dependency-version: 13.0.2\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n  dependency-group: npm-development\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2026-08-02T00:02:04+03:00",
          "tree_id": "cb991f2574971e1e98eabab33d8b97028ac075cb",
          "url": "https://github.com/edloidas/roll-parser/commit/374b4915fb868bc107a79202c549a5b4bf78b8fe"
        },
        "date": 1785618324881,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 130.34,
            "range": "± 4.57 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=130.34ns p75=134.91ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 198.05,
            "range": "± 1.56 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=198.05ns p75=199.6ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 112.28,
            "range": "± 3.17 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=112.28ns p75=115.45ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 182.05,
            "range": "± 30.21 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=182.05ns p75=212.26ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 77.49,
            "range": "± 58.65 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=77.49ns p75=136.14ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 219.28,
            "range": "± 2.54 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=219.28ns p75=221.83ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 351.84,
            "range": "± 2.71 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=351.84ns p75=354.55ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 280.83,
            "range": "± 1.45 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=280.83ns p75=282.28ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 216.57,
            "range": "± 0.97 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=216.57ns p75=217.54ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 556.72,
            "range": "± 7.62 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=556.72ns p75=564.34ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 231.8,
            "range": "± 1.76 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=231.8ns p75=233.56ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 267.37,
            "range": "± 1.6 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=267.37ns p75=268.96ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 569.76,
            "range": "± 4.64 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=569.76ns p75=574.4ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1228.09,
            "range": "± 7.72 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1228.09ns p75=1235.81ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 129.76,
            "range": "± 2.28 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=129.76ns p75=132.04ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 132.37,
            "range": "± 2.25 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=132.37ns p75=134.62ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 292.14,
            "range": "± 2.66 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=292.14ns p75=294.79ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 478.71,
            "range": "± 3.38 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=478.71ns p75=482.08ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 232.17,
            "range": "± 0.85 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=232.17ns p75=233.02ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 422.77,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=422.77ns p75=424.55ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 140.86,
            "range": "± 2.09 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=140.86ns p75=142.94ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 493.82,
            "range": "± 2.51 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=493.82ns p75=496.33ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 748.08,
            "range": "± 4.39 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=748.08ns p75=752.47ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 643.66,
            "range": "± 4.76 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=643.66ns p75=648.42ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 476.16,
            "range": "± 3.18 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=476.16ns p75=479.34ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1127.63,
            "range": "± 7.51 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1127.63ns p75=1135.14ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 516.75,
            "range": "± 2.55 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=516.75ns p75=519.29ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 610.39,
            "range": "± 3.2 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=610.39ns p75=613.59ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1329.29,
            "range": "± 8.58 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1329.29ns p75=1337.88ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2751.52,
            "range": "± 12.65 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2751.52ns p75=2764.18ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 283.21,
            "range": "± 2.74 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=283.21ns p75=285.94ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 287.58,
            "range": "± 2.51 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=287.58ns p75=290.09ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 658.58,
            "range": "± 3.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=658.58ns p75=662.35ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1083.85,
            "range": "± 6.6 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1083.85ns p75=1090.46ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 821.05,
            "range": "± 6.9 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=821.05ns p75=827.95ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1184.62,
            "range": "± 6.38 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1184.62ns p75=1191ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 866.85,
            "range": "± 3.29 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=866.85ns p75=870.14ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2230.19,
            "range": "± 14.81 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2230.19ns p75=2245ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2273.22,
            "range": "± 15.32 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2273.22ns p75=2288.54ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3457.34,
            "range": "± 21.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3457.34ns p75=3479.1ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2183.35,
            "range": "± 20.25 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2183.35ns p75=2203.6ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2595.21,
            "range": "± 28.03 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2595.21ns p75=2623.23ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1183.68,
            "range": "± 6.65 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1183.68ns p75=1190.33ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6947.18,
            "range": "± 84.49 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6947.18ns p75=7031.68ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6017.62,
            "range": "± 79.56 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6017.62ns p75=6097.18ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7083.03,
            "range": "± 40.15 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7083.03ns p75=7123.18ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8937.94,
            "range": "± 33.61 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8937.94ns p75=8971.54ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 81480.05,
            "range": "± 69.79 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=81480.05ns p75=81549.84ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 691.31,
            "range": "± 8.16 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=691.31ns p75=699.46ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1596.71,
            "range": "± 9.99 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1596.71ns p75=1606.69ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 9201.05,
            "range": "± 34.06 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=9201.05ns p75=9235.1ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 82469.08,
            "range": "± 277.94 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=82469.08ns p75=82747.02ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1379.23,
            "range": "± 8.99 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1379.23ns p75=1388.22ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4223.36,
            "range": "± 33.83 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4223.36ns p75=4257.19ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 29985.99,
            "range": "± 49.44 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=29985.99ns p75=30035.43ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 303190.66,
            "range": "± 1881.51 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=303190.66ns p75=305072.18ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1260.82,
            "range": "± 45.21 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1260.82ns p75=1306.03ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1934.71,
            "range": "± 14.27 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1934.71ns p75=1948.99ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1388.8,
            "range": "± 7.89 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1388.8ns p75=1396.69ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1982.52,
            "range": "± 13.36 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1982.52ns p75=1995.89ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1316.7,
            "range": "± 7.65 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1316.7ns p75=1324.35ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3189.77,
            "range": "± 25.94 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3189.77ns p75=3215.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3492.59,
            "range": "± 29.97 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3492.59ns p75=3522.56ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4495.65,
            "range": "± 21.45 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4495.65ns p75=4517.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3089.2,
            "range": "± 16.82 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3089.2ns p75=3106.02ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4205.41,
            "range": "± 53.22 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4205.41ns p75=4258.63ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2174.06,
            "range": "± 21.63 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2174.06ns p75=2195.69ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8142.8,
            "range": "± 17.25 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8142.8ns p75=8160.05ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8144.7,
            "range": "± 39.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8144.7ns p75=8184.16ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10623.56,
            "range": "± 27.83 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10623.56ns p75=10651.39ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9580.83,
            "range": "± 23.94 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9580.83ns p75=9604.77ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 81884.1,
            "range": "± 127.92 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=81884.1ns p75=82012.02ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1085.71,
            "range": "± 8.72 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1085.71ns p75=1094.44ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1737.54,
            "range": "± 6.86 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1737.54ns p75=1744.41ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1231.47,
            "range": "± 6.51 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1231.47ns p75=1237.98ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1806.82,
            "range": "± 14.92 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1806.82ns p75=1821.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1192.39,
            "range": "± 5.36 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1192.39ns p75=1197.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3079.38,
            "range": "± 38.4 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3079.38ns p75=3117.78ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3382.24,
            "range": "± 30.38 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3382.24ns p75=3412.62ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4828.38,
            "range": "± 51.11 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4828.38ns p75=4879.5ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4012.17,
            "range": "± 66.74 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4012.17ns p75=4078.92ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2010.28,
            "range": "± 31.92 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2010.28ns p75=2042.21ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10468.45,
            "range": "± 49.22 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10468.45ns p75=10517.67ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10797.74,
            "range": "± 68.52 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10797.74ns p75=10866.27ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 91552.57,
            "range": "± 462.43 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=91552.57ns p75=92015ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "0030090781e0ee18006353430df7e339d2e9f66f",
          "message": "test: add explicit timeout to dist-building test hooks #189\n\nPassed a 60s per-hook timeout to the `beforeAll` in `readme.test.ts` and `package-smoke.test.ts`, so a slow `ensureFreshDist()` build no longer trips Bun's 5s default and fails the `--bail` gate.",
          "timestamp": "2026-08-02T00:27:51+03:00",
          "tree_id": "2d92ecb2c382166b8bb7379003047e089bfa7584",
          "url": "https://github.com/edloidas/roll-parser/commit/0030090781e0ee18006353430df7e339d2e9f66f"
        },
        "date": 1785619869793,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 107.37,
            "range": "± 2.44 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=107.37ns p75=109.81ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 141.14,
            "range": "± 0.59 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=141.14ns p75=141.73ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 93.5,
            "range": "± 8.42 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=93.5ns p75=101.92ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 133.01,
            "range": "± 85.14 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=133.01ns p75=218.15ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 62.87,
            "range": "± 3.28 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=62.87ns p75=66.15ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 166.2,
            "range": "± 0.82 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=166.2ns p75=167.02ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 263.41,
            "range": "± 0.66 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=263.41ns p75=264.07ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 206.92,
            "range": "± 0.76 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=206.92ns p75=207.68ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 156.58,
            "range": "± 0.72 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=156.58ns p75=157.3ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 402.31,
            "range": "± 1.92 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=402.31ns p75=404.23ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 163.76,
            "range": "± 0.86 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=163.76ns p75=164.63ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 196.53,
            "range": "± 0.76 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=196.53ns p75=197.29ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 435.15,
            "range": "± 1.39 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=435.15ns p75=436.54ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 923.5,
            "range": "± 7.99 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=923.5ns p75=931.49ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 103.42,
            "range": "± 3.81 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=103.42ns p75=107.24ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 105.16,
            "range": "± 3.75 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=105.16ns p75=108.91ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 204.51,
            "range": "± 1.23 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=204.51ns p75=205.73ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 287.88,
            "range": "± 2.09 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=287.88ns p75=289.97ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 178.38,
            "range": "± 0.54 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=178.38ns p75=178.91ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 267.38,
            "range": "± 1.06 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=267.38ns p75=268.45ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 112.65,
            "range": "± 3.59 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=112.65ns p75=116.24ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 310.77,
            "range": "± 1.7 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=310.77ns p75=312.48ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 490.5,
            "range": "± 1.74 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=490.5ns p75=492.24ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 410.15,
            "range": "± 1.43 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=410.15ns p75=411.58ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 305.12,
            "range": "± 1.91 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=305.12ns p75=307.03ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 806.27,
            "range": "± 4.27 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=806.27ns p75=810.54ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 304.04,
            "range": "± 1.84 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=304.04ns p75=305.88ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 381.73,
            "range": "± 1.27 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=381.73ns p75=383ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 926.49,
            "range": "± 1.89 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=926.49ns p75=928.38ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2086.02,
            "range": "± 15.57 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2086.02ns p75=2101.59ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 199.69,
            "range": "± 1.04 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=199.69ns p75=200.73ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 201.95,
            "range": "± 0.96 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=201.95ns p75=202.91ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 457.5,
            "range": "± 1.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=457.5ns p75=459.16ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 804.57,
            "range": "± 1.9 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=804.57ns p75=806.47ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 596.32,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=596.32ns p75=598.69ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 891.14,
            "range": "± 2.32 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=891.14ns p75=893.45ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 632.04,
            "range": "± 2.17 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=632.04ns p75=634.21ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1662.68,
            "range": "± 10.53 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1662.68ns p75=1673.21ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1727.37,
            "range": "± 9.06 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1727.37ns p75=1736.43ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2616.01,
            "range": "± 23.48 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2616.01ns p75=2639.48ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1667.77,
            "range": "± 13.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1667.77ns p75=1681.21ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 1992.7,
            "range": "± 26.04 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=1992.7ns p75=2018.74ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 865.2,
            "range": "± 3.19 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=865.2ns p75=868.4ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 5302.09,
            "range": "± 54.94 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=5302.09ns p75=5357.02ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 4504.52,
            "range": "± 61.22 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=4504.52ns p75=4565.74ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 5547.29,
            "range": "± 27.07 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=5547.29ns p75=5574.36ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 6968.79,
            "range": "± 32.2 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=6968.79ns p75=7000.99ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 63874.68,
            "range": "± 561.29 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=63874.68ns p75=64435.97ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 479.92,
            "range": "± 2.18 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=479.92ns p75=482.1ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1154.89,
            "range": "± 5.59 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1154.89ns p75=1160.48ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 7144.35,
            "range": "± 57.56 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=7144.35ns p75=7201.92ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 64368.56,
            "range": "± 201.81 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=64368.56ns p75=64570.36ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1016.63,
            "range": "± 5.22 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1016.63ns p75=1021.85ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3231.4,
            "range": "± 17.34 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3231.4ns p75=3248.74ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 22838.47,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=22838.47ns p75=22840.25ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 242091.82,
            "range": "± 438.65 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=242091.82ns p75=242530.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 952.09,
            "range": "± 11.53 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=952.09ns p75=963.62ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1454.51,
            "range": "± 5.51 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1454.51ns p75=1460.02ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1042.75,
            "range": "± 5.42 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1042.75ns p75=1048.17ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1484.71,
            "range": "± 12.15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1484.71ns p75=1496.86ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 959.47,
            "range": "± 3.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=959.47ns p75=963.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2353.32,
            "range": "± 22.66 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2353.32ns p75=2375.99ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 2604.71,
            "range": "± 35.64 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=2604.71ns p75=2640.35ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 3366.53,
            "range": "± 13.63 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=3366.53ns p75=3380.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2303.3,
            "range": "± 24.73 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2303.3ns p75=2328.03ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3108.24,
            "range": "± 18.3 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3108.24ns p75=3126.54ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1655.97,
            "range": "± 10.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1655.97ns p75=1666.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 6131.33,
            "range": "± 25.17 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=6131.33ns p75=6156.5ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 5808.35,
            "range": "± 40.75 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=5808.35ns p75=5849.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 8427.81,
            "range": "± 37.37 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=8427.81ns p75=8465.19ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 7640.72,
            "range": "± 22.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=7640.72ns p75=7663.39ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 64836.62,
            "range": "± 71.69 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=64836.62ns p75=64908.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 833.58,
            "range": "± 3.8 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=833.58ns p75=837.38ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1335.96,
            "range": "± 6.4 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1335.96ns p75=1342.37ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 952.63,
            "range": "± 2.82 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=952.63ns p75=955.46ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1372.28,
            "range": "± 4.75 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1372.28ns p75=1377.03ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 886.48,
            "range": "± 3.46 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=886.48ns p75=889.94ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2305.53,
            "range": "± 20.29 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2305.53ns p75=2325.81ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 2520.13,
            "range": "± 26.56 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=2520.13ns p75=2546.69ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 3753.42,
            "range": "± 45.16 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=3753.42ns p75=3798.58ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3042.17,
            "range": "± 20.15 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3042.17ns p75=3062.32ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1511.2,
            "range": "± 22.87 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1511.2ns p75=1534.07ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 8412.11,
            "range": "± 40.57 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=8412.11ns p75=8452.68ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 8606.53,
            "range": "± 23.29 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=8606.53ns p75=8629.82ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 73523.29,
            "range": "± 162.41 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=73523.29ns p75=73685.69ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "7c76aff453f02b7056a0af0f94383186fe486ea2",
          "message": "test: add guard-heavy and count-one keep/drop bench cases #190\n\nAdded `100d6kh1` to the heavy tier, sizing the `count === 1` keep/drop pool so the `markSingleExtreme` linear scan from #164 is distinguishable from the comparator sort it replaced.\nAdded `{1d6+2}kh1` to the common tier, isolating the guard-heavy parse shape from #163 that `{2d20kh1+5, 3d8!}kh1` only measures diluted.\nLeft `variableWork` unset on both so they join `FIXED_WORK_CASES` and gain a `roll (injected RNG)` series.",
          "timestamp": "2026-08-02T00:40:57+03:00",
          "tree_id": "a033411b6e23cb09b968273e6cda4f4f37ffad44",
          "url": "https://github.com/edloidas/roll-parser/commit/7c76aff453f02b7056a0af0f94383186fe486ea2"
        },
        "date": 1785620675393,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 145.53,
            "range": "± 1.2 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=145.53ns p75=146.72ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 187.89,
            "range": "± 13.04 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=187.89ns p75=200.93ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 125.2,
            "range": "± 10.61 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=125.2ns p75=135.81ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 171.43,
            "range": "± 2.14 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=171.43ns p75=173.57ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 83.64,
            "range": "± 3.93 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=83.64ns p75=87.58ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 213.5,
            "range": "± 1.42 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=213.5ns p75=214.92ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 326.27,
            "range": "± 3.09 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=326.27ns p75=329.36ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 345.09,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=345.09ns p75=347.46ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 266.02,
            "range": "± 1.64 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=266.02ns p75=267.66ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 209.78,
            "range": "± 1.83 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=209.78ns p75=211.61ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 533.8,
            "range": "± 3.32 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=533.8ns p75=537.12ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 214.33,
            "range": "± 0.92 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=214.33ns p75=215.24ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 251.45,
            "range": "± 1.43 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=251.45ns p75=252.88ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 568.21,
            "range": "± 4.57 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=568.21ns p75=572.78ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1206.18,
            "range": "± 9.5 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1206.18ns p75=1215.67ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 139,
            "range": "± 0.98 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=139ns p75=139.98ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 220.87,
            "range": "± 1.75 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=220.87ns p75=222.62ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 135.69,
            "range": "± 2.32 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=135.69ns p75=138.01ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 272.56,
            "range": "± 2.56 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=272.56ns p75=275.12ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 380.93,
            "range": "± 1.84 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=380.93ns p75=382.77ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 231.03,
            "range": "± 1.35 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=231.03ns p75=232.39ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 354.75,
            "range": "± 2.28 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=354.75ns p75=357.04ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 150.44,
            "range": "± 0.87 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=150.44ns p75=151.31ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 402.02,
            "range": "± 1.58 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=402.02ns p75=403.6ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 745.98,
            "range": "± 6.32 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=745.98ns p75=752.3ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 666.11,
            "range": "± 6.33 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=666.11ns p75=672.44ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 545.75,
            "range": "± 4.53 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=545.75ns p75=550.28ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 410.59,
            "range": "± 2.97 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=410.59ns p75=413.56ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1072.63,
            "range": "± 7.56 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1072.63ns p75=1080.19ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 432.57,
            "range": "± 3.86 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=432.57ns p75=436.43ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 545.71,
            "range": "± 3.43 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=545.71ns p75=549.14ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1271.85,
            "range": "± 7.56 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1271.85ns p75=1279.41ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2750.77,
            "range": "± 65.51 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2750.77ns p75=2816.28ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 272.18,
            "range": "± 1.61 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=272.18ns p75=273.79ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 468.77,
            "range": "± 1.93 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=468.77ns p75=470.7ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 274,
            "range": "± 1.31 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=274ns p75=275.31ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 602.14,
            "range": "± 3.07 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=602.14ns p75=605.21ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1047.34,
            "range": "± 13.5 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1047.34ns p75=1060.84ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 802.85,
            "range": "± 4.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=802.85ns p75=807.5ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1161.66,
            "range": "± 8.5 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1161.66ns p75=1170.16ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 880.45,
            "range": "± 4.56 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=880.45ns p75=885.01ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2308.32,
            "range": "± 30.97 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2308.32ns p75=2339.29ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 2218.84,
            "range": "± 21.08 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=2218.84ns p75=2239.92ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2391.5,
            "range": "± 16.55 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2391.5ns p75=2408.05ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3705.6,
            "range": "± 36.42 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3705.6ns p75=3742.03ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2343.63,
            "range": "± 32.52 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2343.63ns p75=2376.15ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2646.53,
            "range": "± 16.75 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2646.53ns p75=2663.28ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1193.6,
            "range": "± 11.82 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1193.6ns p75=1205.42ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7617,
            "range": "± 54.84 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7617ns p75=7671.84ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6276.22,
            "range": "± 59.25 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6276.22ns p75=6335.47ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7388.24,
            "range": "± 53.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7388.24ns p75=7442ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 10811.99,
            "range": "± 47.36 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=10811.99ns p75=10859.35ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 30126.22,
            "range": "± 84.08 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=30126.22ns p75=30210.3ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 100245.11,
            "range": "± 861.15 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=100245.11ns p75=101106.27ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 627.81,
            "range": "± 6.58 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=627.81ns p75=634.39ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1673.57,
            "range": "± 10.04 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1673.57ns p75=1683.61ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 10811.35,
            "range": "± 52.37 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=10811.35ns p75=10863.72ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 99659.5,
            "range": "± 259.27 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=99659.5ns p75=99918.77ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1382.85,
            "range": "± 11.59 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1382.85ns p75=1394.44ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4573.69,
            "range": "± 25.52 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4573.69ns p75=4599.21ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 32914.95,
            "range": "± 160.25 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=32914.95ns p75=33075.21ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 337718.78,
            "range": "± 1370.74 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=337718.78ns p75=339089.52ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1275.75,
            "range": "± 16.43 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1275.75ns p75=1292.18ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1929.66,
            "range": "± 10.95 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1929.66ns p75=1940.61ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1397.83,
            "range": "± 13.75 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1397.83ns p75=1411.57ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1981.9,
            "range": "± 5.81 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1981.9ns p75=1987.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1359.23,
            "range": "± 9.73 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1359.23ns p75=1368.96ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3252.99,
            "range": "± 23.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3252.99ns p75=3276.4ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 3387.15,
            "range": "± 19.58 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=3387.15ns p75=3406.73ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3578.94,
            "range": "± 20.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3578.94ns p75=3599.35ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4802.41,
            "range": "± 23.17 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4802.41ns p75=4825.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3259.7,
            "range": "± 23.57 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3259.7ns p75=3283.27ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4232.51,
            "range": "± 24.86 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4232.51ns p75=4257.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2176.22,
            "range": "± 20.23 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2176.22ns p75=2196.45ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8582.12,
            "range": "± 35.42 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8582.12ns p75=8617.54ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7886.5,
            "range": "± 58.45 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7886.5ns p75=7944.95ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10922.27,
            "range": "± 35.66 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10922.27ns p75=10957.92ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 11453.91,
            "range": "± 61.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=11453.91ns p75=11515.78ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 30586.73,
            "range": "± 69.34 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=30586.73ns p75=30656.07ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 99012.79,
            "range": "± 216.84 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=99012.79ns p75=99229.64ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1066.18,
            "range": "± 16.29 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1066.18ns p75=1082.47ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1744.11,
            "range": "± 16.43 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1744.11ns p75=1760.54ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1237.62,
            "range": "± 11.87 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1237.62ns p75=1249.49ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1820.75,
            "range": "± 10.75 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1820.75ns p75=1831.51ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1202.89,
            "range": "± 8.73 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1202.89ns p75=1211.63ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3163.33,
            "range": "± 28.64 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3163.33ns p75=3191.97ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 3190.29,
            "range": "± 17.46 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=3190.29ns p75=3207.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3439.06,
            "range": "± 43.03 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3439.06ns p75=3482.09ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 5151.94,
            "range": "± 44.87 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=5151.94ns p75=5196.81ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4213.01,
            "range": "± 26.58 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4213.01ns p75=4239.59ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2058.88,
            "range": "± 30.57 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2058.88ns p75=2089.46ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10996.92,
            "range": "± 29.03 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10996.92ns p75=11025.95ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 12589.9,
            "range": "± 18.58 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=12589.9ns p75=12608.48ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 31697.71,
            "range": "± 42.08 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=31697.71ns p75=31739.79ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 110179.39,
            "range": "± 774.72 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=110179.39ns p75=110954.12ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "67c2e1eab2ca3d97440bc931e3b104192ca904df",
          "message": "fix: reject missing group mappings and duplicate bench record names #191 (#194)\n\nReplaced the `ungrouped` fallback with a rejection when `trial.group` resolves to no\nlayout entry or to a blank name — the silent rename kept the record count intact while\nstalling the real series and adding a phantom one on the trend chart\nLabeled an unresolvable group as `#<index>`, absorbing the previous empty-group check\nTracked emitted record labels in a `Set` and rejected duplicates within and across trials\nAdded coverage for absent, null, and blank group names and for duplicate labels\n\nCo-authored-by: Claude Opus 5 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-08-02T00:57:29+03:00",
          "tree_id": "4f948db592fc05d2b25adda67e2855cf75c694c5",
          "url": "https://github.com/edloidas/roll-parser/commit/67c2e1eab2ca3d97440bc931e3b104192ca904df"
        },
        "date": 1785621653387,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 128.64,
            "range": "± 4.53 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=128.64ns p75=133.17ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 148.01,
            "range": "± 1.68 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=148.01ns p75=149.68ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 100.82,
            "range": "± 2.9 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=100.82ns p75=103.73ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 135.82,
            "range": "± 1.52 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=135.82ns p75=137.34ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 68.7,
            "range": "± 3.15 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=68.7ns p75=71.86ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 168.27,
            "range": "± 1.12 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=168.27ns p75=169.39ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 230.93,
            "range": "± 0.86 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=230.93ns p75=231.79ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 271.81,
            "range": "± 1.53 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=271.81ns p75=273.34ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 212.8,
            "range": "± 0.72 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=212.8ns p75=213.53ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 164.57,
            "range": "± 1.46 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=164.57ns p75=166.04ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 385.57,
            "range": "± 2.27 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=385.57ns p75=387.84ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 170.52,
            "range": "± 1.42 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=170.52ns p75=171.94ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 201.93,
            "range": "± 0.67 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=201.93ns p75=202.61ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 416.25,
            "range": "± 1.94 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=416.25ns p75=418.19ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 916.96,
            "range": "± 7.13 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=916.96ns p75=924.09ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 110.59,
            "range": "± 2.73 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=110.59ns p75=113.32ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 176.8,
            "range": "± 0.5 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=176.8ns p75=177.29ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 109.49,
            "range": "± 3.13 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=109.49ns p75=112.62ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 213.83,
            "range": "± 0.99 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=213.83ns p75=214.82ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 297.75,
            "range": "± 2.07 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=297.75ns p75=299.82ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 184.3,
            "range": "± 0.88 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=184.3ns p75=185.18ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 277.23,
            "range": "± 1.76 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=277.23ns p75=278.99ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 120.76,
            "range": "± 2.63 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=120.76ns p75=123.39ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 314.47,
            "range": "± 2.01 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=314.47ns p75=316.48ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 546.07,
            "range": "± 4.84 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=546.07ns p75=550.91ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 520.83,
            "range": "± 2.26 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=520.83ns p75=523.08ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 417.94,
            "range": "± 2.16 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=417.94ns p75=420.1ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 325.91,
            "range": "± 2.24 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=325.91ns p75=328.15ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 773.07,
            "range": "± 7.72 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=773.07ns p75=780.79ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 330.29,
            "range": "± 1.61 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=330.29ns p75=331.9ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 432.9,
            "range": "± 2.78 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=432.9ns p75=435.68ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 952.48,
            "range": "± 5.58 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=952.48ns p75=958.06ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2112.87,
            "range": "± 10.52 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2112.87ns p75=2123.39ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 218.62,
            "range": "± 1.24 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=218.62ns p75=219.86ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 378.36,
            "range": "± 4.4 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=378.36ns p75=382.77ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 221.95,
            "range": "± 1.12 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=221.95ns p75=223.08ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 475.81,
            "range": "± 6.48 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=475.81ns p75=482.3ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 859.3,
            "range": "± 5.56 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=859.3ns p75=864.86ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 641.4,
            "range": "± 4.29 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=641.4ns p75=645.69ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 950.01,
            "range": "± 6.02 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=950.01ns p75=956.03ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 666.79,
            "range": "± 8.75 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=666.79ns p75=675.54ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1883.24,
            "range": "± 15.11 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1883.24ns p75=1898.36ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 1771.73,
            "range": "± 13.55 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=1771.73ns p75=1785.28ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1922.51,
            "range": "± 28.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1922.51ns p75=1951.19ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2956.92,
            "range": "± 18.58 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2956.92ns p75=2975.49ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1866.39,
            "range": "± 11.88 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1866.39ns p75=1878.27ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2111.58,
            "range": "± 15.3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2111.58ns p75=2126.88ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 927.41,
            "range": "± 15.11 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=927.41ns p75=942.52ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6005.45,
            "range": "± 32.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6005.45ns p75=6037.72ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 4957.7,
            "range": "± 91.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=4957.7ns p75=5048.97ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 5960.64,
            "range": "± 33.36 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=5960.64ns p75=5994ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8506.59,
            "range": "± 40.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8506.59ns p75=8547.33ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 23695.48,
            "range": "± 109.29 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=23695.48ns p75=23804.77ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 79092.69,
            "range": "± 327.24 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=79092.69ns p75=79419.93ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 494.47,
            "range": "± 7.14 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=494.47ns p75=501.61ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1308.77,
            "range": "± 6.57 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1308.77ns p75=1315.35ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8565.52,
            "range": "± 39.32 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8565.52ns p75=8604.84ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 78532.94,
            "range": "± 131.72 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=78532.94ns p75=78664.66ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1086.55,
            "range": "± 11.38 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1086.55ns p75=1097.93ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3642.16,
            "range": "± 13.59 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3642.16ns p75=3655.74ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 25942.63,
            "range": "± 18.66 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=25942.63ns p75=25961.29ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 269013.19,
            "range": "± 302.87 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=269013.19ns p75=269316.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1010.41,
            "range": "± 10.5 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1010.41ns p75=1020.92ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1565.58,
            "range": "± 11.24 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1565.58ns p75=1576.82ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1130.82,
            "range": "± 7.96 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1130.82ns p75=1138.78ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1614.9,
            "range": "± 6 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1614.9ns p75=1620.9ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1068.07,
            "range": "± 13.29 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1068.07ns p75=1081.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2618.77,
            "range": "± 8.83 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2618.77ns p75=2627.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 2662.54,
            "range": "± 16.22 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=2662.54ns p75=2678.76ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 2840.8,
            "range": "± 16.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=2840.8ns p75=2857.73ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 3827.61,
            "range": "± 10.71 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=3827.61ns p75=3838.32ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2601.1,
            "range": "± 19.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2601.1ns p75=2620.77ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3224.29,
            "range": "± 19.52 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3224.29ns p75=3243.82ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1732.02,
            "range": "± 20.53 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1732.02ns p75=1752.55ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 6758.47,
            "range": "± 52.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=6758.47ns p75=6810.93ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 6245.51,
            "range": "± 44 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=6245.51ns p75=6289.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 8602.28,
            "range": "± 21.26 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=8602.28ns p75=8623.55ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 8967.48,
            "range": "± 30.69 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=8967.48ns p75=8998.17ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 24140.71,
            "range": "± 451.19 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=24140.71ns p75=24591.9ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 78384.76,
            "range": "± 102.84 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=78384.76ns p75=78487.6ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 875.99,
            "range": "± 10.71 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=875.99ns p75=886.7ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1438.98,
            "range": "± 40.38 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1438.98ns p75=1479.35ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1006.79,
            "range": "± 11.45 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1006.79ns p75=1018.24ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1489.8,
            "range": "± 10.18 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1489.8ns p75=1499.99ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 966.16,
            "range": "± 11.3 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=966.16ns p75=977.45ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2549.31,
            "range": "± 14.38 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2549.31ns p75=2563.69ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 2537.91,
            "range": "± 12.34 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=2537.91ns p75=2550.25ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 2714.08,
            "range": "± 27.86 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=2714.08ns p75=2741.94ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4086.34,
            "range": "± 31.07 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4086.34ns p75=4117.41ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3136.92,
            "range": "± 17.33 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3136.92ns p75=3154.25ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1633.3,
            "range": "± 15.1 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1633.3ns p75=1648.4ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 8448.44,
            "range": "± 9.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=8448.44ns p75=8457.83ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 9947.54,
            "range": "± 27.78 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=9947.54ns p75=9975.32ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 24930.87,
            "range": "± 35.83 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=24930.87ns p75=24966.7ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 87210.7,
            "range": "± 177.56 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=87210.7ns p75=87388.26ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "f336d01a9c678f5d1a3067438b7754a6d96272ac",
          "message": "chore: audit and tighten inline comments repo-wide #195\n\nAudited every inline `//` comment in `src/`, `scripts/`, `bench/`, and `site/src/`\nRemoved comments restating adjacent code, test step-narration, and multi-paragraph design stories\nCompacted surviving constraints — precedence rationale, guard invariants, RNG derivations — to one or two lines\nReplaced every issue-number citation in a comment with the constraint it stood for\nDropped three dead `STAGE3.md` pointers; that file has never existed in the repo\nDemoted `// ?` on settled decisions to plain comments and fixed `// *` divider shape\nAdded the missing `COMPARE: 8` row to the `BP` precedence table in `parser.ts`\nCorrected `seeded.ts` rejection sampling — the loop rejects the leading block, not a trailing one\nLabeled the tuple elements of `cases` in `parts.test.ts` so the column-header comment could go\nDocumented the continuation-line rule in `.claude/rules/comments.md` and repeated `// !` / `// ?` on every line of a block",
          "timestamp": "2026-08-02T01:39:02+03:00",
          "tree_id": "c994b22a35da3060ad4602992a6a6d5e8af08e03",
          "url": "https://github.com/edloidas/roll-parser/commit/f336d01a9c678f5d1a3067438b7754a6d96272ac"
        },
        "date": 1785624151739,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 144.54,
            "range": "± 6.51 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=144.54ns p75=151.05ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 188.35,
            "range": "± 1.67 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=188.35ns p75=190.02ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 124.24,
            "range": "± 1.98 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=124.24ns p75=126.22ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 168.84,
            "range": "± 5.97 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=168.84ns p75=174.81ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 85.94,
            "range": "± 6.45 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=85.94ns p75=92.39ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 206.88,
            "range": "± 1.97 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=206.88ns p75=208.85ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 281.78,
            "range": "± 2.56 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=281.78ns p75=284.34ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 339.72,
            "range": "± 2.69 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=339.72ns p75=342.41ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 267.64,
            "range": "± 1.68 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=267.64ns p75=269.32ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 201.14,
            "range": "± 2.18 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=201.14ns p75=203.32ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 501.03,
            "range": "± 2.95 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=501.03ns p75=503.98ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 214.95,
            "range": "± 1.04 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=214.95ns p75=215.99ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 247.95,
            "range": "± 2.14 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=247.95ns p75=250.09ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 512.3,
            "range": "± 2.52 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=512.3ns p75=514.83ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1171.39,
            "range": "± 6.88 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1171.39ns p75=1178.27ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 143.26,
            "range": "± 2.19 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=143.26ns p75=145.45ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 218.24,
            "range": "± 0.82 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=218.24ns p75=219.07ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 144.13,
            "range": "± 2.52 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=144.13ns p75=146.65ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 296.69,
            "range": "± 2.77 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=296.69ns p75=299.46ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 429.27,
            "range": "± 2.95 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=429.27ns p75=432.22ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 219.91,
            "range": "± 2.26 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=219.91ns p75=222.16ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 356.65,
            "range": "± 1.73 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=356.65ns p75=358.38ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 150.77,
            "range": "± 1.05 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=150.77ns p75=151.82ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 414.16,
            "range": "± 2.05 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=414.16ns p75=416.2ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 724.66,
            "range": "± 3.67 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=724.66ns p75=728.32ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 691.36,
            "range": "± 3.96 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=691.36ns p75=695.32ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 577.17,
            "range": "± 3.34 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=577.17ns p75=580.51ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 441.49,
            "range": "± 2.36 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=441.49ns p75=443.85ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1001.79,
            "range": "± 9.18 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1001.79ns p75=1010.98ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 472.88,
            "range": "± 2.82 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=472.88ns p75=475.7ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 567.18,
            "range": "± 4.15 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=567.18ns p75=571.33ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1270.68,
            "range": "± 8.34 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1270.68ns p75=1279.02ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2576.56,
            "range": "± 15.61 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2576.56ns p75=2592.16ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 305.4,
            "range": "± 2.43 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=305.4ns p75=307.82ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 507.52,
            "range": "± 2.61 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=507.52ns p75=510.13ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 312.15,
            "range": "± 2.4 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=312.15ns p75=314.55ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 664.82,
            "range": "± 3.54 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=664.82ns p75=668.36ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1096.97,
            "range": "± 4.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1096.97ns p75=1101.71ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 823.76,
            "range": "± 5.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=823.76ns p75=828.99ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1192.62,
            "range": "± 7.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1192.62ns p75=1199.89ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 863.88,
            "range": "± 6.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=863.88ns p75=870.16ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2158.59,
            "range": "± 19.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2158.59ns p75=2178.48ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 2116.26,
            "range": "± 18.93 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=2116.26ns p75=2135.19ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2159.41,
            "range": "± 21.65 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2159.41ns p75=2181.06ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3483.45,
            "range": "± 26.22 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3483.45ns p75=3509.68ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2165.67,
            "range": "± 14.93 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2165.67ns p75=2180.6ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2572.41,
            "range": "± 19.43 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2572.41ns p75=2591.84ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1220.83,
            "range": "± 8.3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1220.83ns p75=1229.13ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6888.91,
            "range": "± 64.85 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6888.91ns p75=6953.76ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5915,
            "range": "± 29.47 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5915ns p75=5944.46ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7027.66,
            "range": "± 38.29 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7027.66ns p75=7065.95ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8697.26,
            "range": "± 48.01 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8697.26ns p75=8745.27ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 23123.42,
            "range": "± 22.61 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=23123.42ns p75=23146.02ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 79639.89,
            "range": "± 425.4 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=79639.89ns p75=80065.29ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 686.4,
            "range": "± 9.55 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=686.4ns p75=695.96ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1555.43,
            "range": "± 9.14 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1555.43ns p75=1564.57ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8747.86,
            "range": "± 46.47 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8747.86ns p75=8794.34ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 79383.58,
            "range": "± 596.41 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=79383.58ns p75=79979.99ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1364.66,
            "range": "± 12.3 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1364.66ns p75=1376.96ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4146.73,
            "range": "± 16.38 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4146.73ns p75=4163.11ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 28989.39,
            "range": "± 58.63 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=28989.39ns p75=29048.01ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 295606.34,
            "range": "± 207.9 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=295606.34ns p75=295814.24ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1259.97,
            "range": "± 29.78 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1259.97ns p75=1289.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1882.45,
            "range": "± 12.82 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1882.45ns p75=1895.27ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1400.1,
            "range": "± 10.9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1400.1ns p75=1410.99ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1922.86,
            "range": "± 11.94 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1922.86ns p75=1934.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1299.23,
            "range": "± 15.81 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1299.23ns p75=1315.04ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3096.14,
            "range": "± 28.38 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3096.14ns p75=3124.52ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 3243.18,
            "range": "± 30.53 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=3243.18ns p75=3273.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3333.01,
            "range": "± 14.91 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3333.01ns p75=3347.91ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4434.55,
            "range": "± 25 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4434.55ns p75=4459.55ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3028.97,
            "range": "± 25.65 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3028.97ns p75=3054.62ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4025.82,
            "range": "± 22.07 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4025.82ns p75=4047.89ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2141.36,
            "range": "± 23.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2141.36ns p75=2164.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 7915.3,
            "range": "± 44.76 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=7915.3ns p75=7960.06ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7971.25,
            "range": "± 63.27 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7971.25ns p75=8034.52ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10227.19,
            "range": "± 49.96 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10227.19ns p75=10277.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9371.12,
            "range": "± 31.95 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9371.12ns p75=9403.07ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 24603.83,
            "range": "± 67.44 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=24603.83ns p75=24671.27ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 79173.83,
            "range": "± 328.43 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=79173.83ns p75=79502.25ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1097.75,
            "range": "± 13.47 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1097.75ns p75=1111.22ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1729.72,
            "range": "± 21.36 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1729.72ns p75=1751.08ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1266.25,
            "range": "± 7.17 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1266.25ns p75=1273.42ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1793.99,
            "range": "± 15.1 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1793.99ns p75=1809.09ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1185.42,
            "range": "± 14.54 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1185.42ns p75=1199.96ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3015.55,
            "range": "± 24.03 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3015.55ns p75=3039.59ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 3062.45,
            "range": "± 18.38 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=3062.45ns p75=3080.83ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3300.97,
            "range": "± 20.84 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3300.97ns p75=3321.81ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4727.3,
            "range": "± 84.81 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4727.3ns p75=4812.11ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3809.57,
            "range": "± 27.1 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3809.57ns p75=3836.68ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1942.21,
            "range": "± 13.5 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1942.21ns p75=1955.72ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10084.27,
            "range": "± 48.16 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10084.27ns p75=10132.44ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 10486.72,
            "range": "± 40.11 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=10486.72ns p75=10526.83ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 25659.04,
            "range": "± 20.45 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=25659.04ns p75=25679.49ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 89356.48,
            "range": "± 269.61 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=89356.48ns p75=89626.1ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "2549f739edc210252c704d8a4ecdc6768c5ee105",
          "message": "chore: audit and tighten inline comments repo-wide #195\n\nDropped the issue-number provenance stamps from nine module and function TSDoc headers\nKept the two `#143` citations that back the bench measurements whose raw data lives only in the issue",
          "timestamp": "2026-08-02T00:43:35+02:00",
          "tree_id": "15e50c3fe0c47716a1aa52d9cf70ee55cbaa5ce9",
          "url": "https://github.com/edloidas/roll-parser/commit/2549f739edc210252c704d8a4ecdc6768c5ee105"
        },
        "date": 1785624424941,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 141.15,
            "range": "± 4.85 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=141.15ns p75=146ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 187.54,
            "range": "± 2.48 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=187.54ns p75=190.02ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 158.51,
            "range": "± 83.94 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=158.51ns p75=242.45ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 170.4,
            "range": "± 2.1 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=170.4ns p75=172.51ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 85,
            "range": "± 6.4 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=85ns p75=91.4ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 209.29,
            "range": "± 1.87 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=209.29ns p75=211.16ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 283.91,
            "range": "± 2.71 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=283.91ns p75=286.62ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 341.59,
            "range": "± 2.35 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=341.59ns p75=343.94ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 270.33,
            "range": "± 1.41 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=270.33ns p75=271.74ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 205.44,
            "range": "± 2.21 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=205.44ns p75=207.64ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 505.67,
            "range": "± 3.11 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=505.67ns p75=508.78ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 216.11,
            "range": "± 1.13 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=216.11ns p75=217.24ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 254.72,
            "range": "± 2.05 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=254.72ns p75=256.77ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 522.77,
            "range": "± 2.77 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=522.77ns p75=525.55ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1174.72,
            "range": "± 8.11 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1174.72ns p75=1182.83ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 146.14,
            "range": "± 1.03 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=146.14ns p75=147.17ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 229.04,
            "range": "± 1.28 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=229.04ns p75=230.32ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 149.35,
            "range": "± 1.44 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=149.35ns p75=150.79ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 306.21,
            "range": "± 2.41 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=306.21ns p75=308.62ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 431.86,
            "range": "± 2.63 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=431.86ns p75=434.49ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 234.05,
            "range": "± 1.47 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=234.05ns p75=235.52ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 385.81,
            "range": "± 2.15 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=385.81ns p75=387.96ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 155.54,
            "range": "± 1.15 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=155.54ns p75=156.69ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 450.59,
            "range": "± 2.96 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=450.59ns p75=453.55ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 765.29,
            "range": "± 5.53 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=765.29ns p75=770.82ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 727.93,
            "range": "± 5.02 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=727.93ns p75=732.95ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 619.2,
            "range": "± 3.51 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=619.2ns p75=622.71ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 444.34,
            "range": "± 2.74 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=444.34ns p75=447.08ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1045.69,
            "range": "± 9.3 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1045.69ns p75=1054.98ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 480.64,
            "range": "± 2.89 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=480.64ns p75=483.53ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 588.25,
            "range": "± 4.14 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=588.25ns p75=592.39ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1292.62,
            "range": "± 7.11 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1292.62ns p75=1299.72ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2642.99,
            "range": "± 9.35 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2642.99ns p75=2652.34ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 311.38,
            "range": "± 3.27 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=311.38ns p75=314.65ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 523.41,
            "range": "± 3.26 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=523.41ns p75=526.67ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 312.05,
            "range": "± 3.08 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=312.05ns p75=315.13ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 683.61,
            "range": "± 5.02 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=683.61ns p75=688.63ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1164.3,
            "range": "± 12.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1164.3ns p75=1177.19ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 815.56,
            "range": "± 8.63 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=815.56ns p75=824.19ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1256.98,
            "range": "± 13.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1256.98ns p75=1270.72ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 853.16,
            "range": "± 7.49 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=853.16ns p75=860.65ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2121.64,
            "range": "± 27.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2121.64ns p75=2149.41ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 2187.34,
            "range": "± 22.28 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=2187.34ns p75=2209.62ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2299.94,
            "range": "± 20.38 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2299.94ns p75=2320.32ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3093.99,
            "range": "± 15.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3093.99ns p75=3109.17ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2151.1,
            "range": "± 17.88 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2151.1ns p75=2168.98ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2916.82,
            "range": "± 35.02 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2916.82ns p75=2951.85ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1262.78,
            "range": "± 14.82 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1262.78ns p75=1277.59ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 6361.56,
            "range": "± 33.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=6361.56ns p75=6395.33ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6068.75,
            "range": "± 71.99 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6068.75ns p75=6140.73ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7779.79,
            "range": "± 49.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7779.79ns p75=7829.53ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 7513.02,
            "range": "± 29.47 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=7513.02ns p75=7542.48ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 21191.29,
            "range": "± 100.73 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=21191.29ns p75=21292.02ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 66509.82,
            "range": "± 289.78 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=66509.82ns p75=66799.6ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 729.97,
            "range": "± 6.82 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=729.97ns p75=736.79ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1385.74,
            "range": "± 14.66 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1385.74ns p75=1400.4ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 7450.79,
            "range": "± 68.28 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=7450.79ns p75=7519.07ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 65549.63,
            "range": "± 255.25 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=65549.63ns p75=65804.88ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1435.42,
            "range": "± 11.98 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1435.42ns p75=1447.4ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3931.58,
            "range": "± 16.12 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3931.58ns p75=3947.71ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 26965.54,
            "range": "± 131.67 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=26965.54ns p75=27097.21ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 273846.51,
            "range": "± 957.82 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=273846.51ns p75=274804.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1288.34,
            "range": "± 22.48 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1288.34ns p75=1310.82ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1965.41,
            "range": "± 18.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1965.41ns p75=1984.08ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1386.38,
            "range": "± 8.91 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1386.38ns p75=1395.29ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 2011.61,
            "range": "± 21.16 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=2011.61ns p75=2032.76ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1304.04,
            "range": "± 11.15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1304.04ns p75=1315.19ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3111.68,
            "range": "± 20.39 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3111.68ns p75=3132.07ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 3420.94,
            "range": "± 28.7 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=3420.94ns p75=3449.63ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3570.43,
            "range": "± 33.54 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3570.43ns p75=3603.97ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4100,
            "range": "± 14.71 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4100ns p75=4114.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3061.28,
            "range": "± 14.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3061.28ns p75=3075.41ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4338.02,
            "range": "± 41.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4338.02ns p75=4379.12ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2284.55,
            "range": "± 26.05 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2284.55ns p75=2310.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 7580.4,
            "range": "± 74.69 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=7580.4ns p75=7655.09ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8192.08,
            "range": "± 40.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8192.08ns p75=8232.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 11309.56,
            "range": "± 36.76 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=11309.56ns p75=11346.32ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 8114.04,
            "range": "± 20.34 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=8114.04ns p75=8134.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 22158.87,
            "range": "± 22.42 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=22158.87ns p75=22181.28ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 66343.51,
            "range": "± 268.85 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=66343.51ns p75=66612.36ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1168.6,
            "range": "± 11.44 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1168.6ns p75=1180.03ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1862.19,
            "range": "± 11.59 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1862.19ns p75=1873.78ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1285.63,
            "range": "± 5.72 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1285.63ns p75=1291.35ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1893.65,
            "range": "± 8.08 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1893.65ns p75=1901.73ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1197.67,
            "range": "± 10.66 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1197.67ns p75=1208.33ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3025.96,
            "range": "± 26.83 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3025.96ns p75=3052.79ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 3235.13,
            "range": "± 20.76 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=3235.13ns p75=3255.88ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3409.85,
            "range": "± 26.84 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3409.85ns p75=3436.7ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4406.47,
            "range": "± 63.56 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4406.47ns p75=4470.03ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4163.59,
            "range": "± 45.74 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4163.59ns p75=4209.33ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2067.58,
            "range": "± 20.31 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2067.58ns p75=2087.9ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 11057.05,
            "range": "± 12.25 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=11057.05ns p75=11069.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 9047.68,
            "range": "± 23.44 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=9047.68ns p75=9071.12ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 22852.76,
            "range": "± 38.1 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=22852.76ns p75=22890.87ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 75488.62,
            "range": "± 18.42 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=75488.62ns p75=75507.04ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "542fee5513bb45a6cf42f624f8767be0f4d0281d",
          "message": "chore: tighten agent instructions, cover untracked failure modes\n\nCompressed two-pass build, TypeDoc, site, pre-commit, issues, and release\nsections to invariant + failure mode; rationale stays in tsconfig/package\ncomments. Added gaps: executable README/MIGRATION fences, 100% function\ncoverage floor, size-limit release gate, `files` shipping `src/` for\ndeclaration maps, `minimumReleaseAge` pin, symlink editing rule, `bun test`\nrebuilding `dist/`. Fixed rng.md Math.random rule to permit SeededRNG\nself-seeding. Moved the `Bun.build` sourcemap caveat from CLAUDE.md to a\ncomment at its call site in `scripts/build-site.ts`. Dropped derivable\ncontent: RNG interface copy, comments.md counter-example, ES2022 target line.",
          "timestamp": "2026-08-02T01:26:33+02:00",
          "tree_id": "3fa07396c64d4149464e479ab27a72e7be9e562b",
          "url": "https://github.com/edloidas/roll-parser/commit/542fee5513bb45a6cf42f624f8767be0f4d0281d"
        },
        "date": 1785627077910,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 84.71,
            "range": "± 2.78 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=84.71ns p75=87.49ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 112.43,
            "range": "± 3.26 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=112.43ns p75=115.69ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 74.35,
            "range": "± 6.04 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=74.35ns p75=80.39ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 101.2,
            "range": "± 4.46 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=101.2ns p75=105.66ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 53.9,
            "range": "± 5.68 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=53.9ns p75=59.58ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 126.52,
            "range": "± 80.65 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=126.52ns p75=207.17ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 168.02,
            "range": "± 3.05 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=168.02ns p75=171.07ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 201.94,
            "range": "± 1.2 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=201.94ns p75=203.14ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 161.92,
            "range": "± 1.86 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=161.92ns p75=163.79ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 124.31,
            "range": "± 4.34 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=124.31ns p75=128.65ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 302.81,
            "range": "± 2.96 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=302.81ns p75=305.77ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 128.54,
            "range": "± 1.56 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=128.54ns p75=130.11ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 150.83,
            "range": "± 1.86 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=150.83ns p75=152.7ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 308.4,
            "range": "± 3.87 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=308.4ns p75=312.27ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 712.8,
            "range": "± 4.92 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=712.8ns p75=717.72ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 85.24,
            "range": "± 5.16 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=85.24ns p75=90.41ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 131.66,
            "range": "± 3.65 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=131.66ns p75=135.31ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 85.48,
            "range": "± 5 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=85.48ns p75=90.48ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 173.45,
            "range": "± 1.09 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=173.45ns p75=174.54ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 253.94,
            "range": "± 1.58 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=253.94ns p75=255.52ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 146.24,
            "range": "± 1.32 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=146.24ns p75=147.55ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 225.94,
            "range": "± 1.57 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=225.94ns p75=227.51ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 96.09,
            "range": "± 0.92 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=96.09ns p75=97.01ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 263.29,
            "range": "± 1.89 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=263.29ns p75=265.17ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 422.94,
            "range": "± 1.58 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=422.94ns p75=424.52ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 412.9,
            "range": "± 2.13 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=412.9ns p75=415.03ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 368.13,
            "range": "± 2.18 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=368.13ns p75=370.3ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 264.65,
            "range": "± 1.72 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=264.65ns p75=266.37ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 598.24,
            "range": "± 3.03 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=598.24ns p75=601.28ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 272.89,
            "range": "± 2.27 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=272.89ns p75=275.15ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 343.21,
            "range": "± 2.52 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=343.21ns p75=345.73ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 738.08,
            "range": "± 2.23 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=738.08ns p75=740.31ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 1604.56,
            "range": "± 7.35 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=1604.56ns p75=1611.91ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 209.73,
            "range": "± 43.5 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=209.73ns p75=253.23ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 343.12,
            "range": "± 4.67 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=343.12ns p75=347.79ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 203.76,
            "range": "± 1.65 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=203.76ns p75=205.41ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 457.65,
            "range": "± 6.31 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=457.65ns p75=463.96ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 700.46,
            "range": "± 3.87 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=700.46ns p75=704.33ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 589.42,
            "range": "± 11.74 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=589.42ns p75=601.17ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 704.47,
            "range": "± 78.03 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=704.47ns p75=782.5ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 616.66,
            "range": "± 31.04 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=616.66ns p75=647.7ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1336.82,
            "range": "± 138.06 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1336.82ns p75=1474.88ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 1156.52,
            "range": "± 25.5 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=1156.52ns p75=1182.02ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1270.08,
            "range": "± 20.39 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1270.08ns p75=1290.46ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2364.95,
            "range": "± 21.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2364.95ns p75=2386.22ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1410.09,
            "range": "± 206.91 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1410.09ns p75=1617.01ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 1468.35,
            "range": "± 11.22 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=1468.35ns p75=1479.57ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 662.51,
            "range": "± 18.21 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=662.51ns p75=680.72ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 5322.6,
            "range": "± 73.87 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=5322.6ns p75=5396.47ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 3460.21,
            "range": "± 66.78 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=3460.21ns p75=3526.99ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 4276.27,
            "range": "± 27.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=4276.27ns p75=4303.45ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 6458.63,
            "range": "± 108.62 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=6458.63ns p75=6567.25ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 17951.14,
            "range": "± 50.52 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=17951.14ns p75=18001.66ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 59028.76,
            "range": "± 199.49 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=59028.76ns p75=59228.25ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 416.94,
            "range": "± 7.89 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=416.94ns p75=424.83ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1041.87,
            "range": "± 4.32 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1041.87ns p75=1046.19ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 6329.01,
            "range": "± 46.89 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=6329.01ns p75=6375.9ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 58671.58,
            "range": "± 476.73 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=58671.58ns p75=59148.31ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 745.34,
            "range": "± 5.43 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=745.34ns p75=750.78ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 2746.12,
            "range": "± 54.3 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=2746.12ns p75=2800.42ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 20514.89,
            "range": "± 78.47 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=20514.89ns p75=20593.36ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 228939.66,
            "range": "± 9150.54 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=228939.66ns p75=238090.2ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 679.45,
            "range": "± 41.55 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=679.45ns p75=721ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1009.67,
            "range": "± 116.58 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1009.67ns p75=1126.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 780.93,
            "range": "± 3.82 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=780.93ns p75=784.75ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1059.33,
            "range": "± 4.31 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1059.33ns p75=1063.65ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 759.25,
            "range": "± 58.9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=759.25ns p75=818.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2020.4,
            "range": "± 24.39 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2020.4ns p75=2044.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 1847.22,
            "range": "± 7.67 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=1847.22ns p75=1854.89ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 1924.39,
            "range": "± 9.17 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=1924.39ns p75=1933.56ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 2927.3,
            "range": "± 20.6 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=2927.3ns p75=2947.9ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 1840.07,
            "range": "± 28.28 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=1840.07ns p75=1868.36ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 2416.31,
            "range": "± 27.89 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=2416.31ns p75=2444.2ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1138.81,
            "range": "± 45.3 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1138.81ns p75=1184.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 5461.01,
            "range": "± 27.08 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=5461.01ns p75=5488.09ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 5125.28,
            "range": "± 58.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=5125.28ns p75=5184.16ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 7394.71,
            "range": "± 163.63 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=7394.71ns p75=7558.34ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 7560.25,
            "range": "± 124.16 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=7560.25ns p75=7684.41ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 18951.42,
            "range": "± 382.37 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=18951.42ns p75=19333.79ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 62076.37,
            "range": "± 4177.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=62076.37ns p75=66254.25ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 589.68,
            "range": "± 7.52 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=589.68ns p75=597.2ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 934.23,
            "range": "± 7.6 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=934.23ns p75=941.83ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 823.05,
            "range": "± 16.26 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=823.05ns p75=839.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1115.67,
            "range": "± 16.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1115.67ns p75=1131.95ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 730,
            "range": "± 5.02 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=730ns p75=735.03ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 1797.1,
            "range": "± 13.04 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=1797.1ns p75=1810.14ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 1749.59,
            "range": "± 24.78 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=1749.59ns p75=1774.36ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 1926.09,
            "range": "± 47.33 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=1926.09ns p75=1973.43ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 3280.31,
            "range": "± 21.17 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=3280.31ns p75=3301.47ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 2433.12,
            "range": "± 264.11 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=2433.12ns p75=2697.24ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1070.74,
            "range": "± 12.08 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1070.74ns p75=1082.82ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 6517.7,
            "range": "± 143.85 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=6517.7ns p75=6661.55ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 8934.69,
            "range": "± 570.26 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=8934.69ns p75=9504.95ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 20544.86,
            "range": "± 28.06 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=20544.86ns p75=20572.91ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 74248.5,
            "range": "± 1333.82 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=74248.5ns p75=75582.33ns mode=batch"
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
          "id": "7c282267ed10982f0840fdcde47be6dee330332b",
          "message": "chore: align npm keywords with discovery terms #198\n\n- Dropped `pratt-parser`, added `dice-parser` and `tabletop`\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-02T16:49:17+03:00",
          "tree_id": "0a24baaa8066aeb46d327893bcb88e0ec0c4c528",
          "url": "https://github.com/edloidas/roll-parser/commit/7c282267ed10982f0840fdcde47be6dee330332b"
        },
        "date": 1785678765958,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 143.43,
            "range": "± 5.3 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=143.43ns p75=148.72ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 189.15,
            "range": "± 2.62 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=189.15ns p75=191.77ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 124.89,
            "range": "± 2.51 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=124.89ns p75=127.41ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 171.71,
            "range": "± 30.93 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=171.71ns p75=202.64ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 85.9,
            "range": "± 3.91 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=85.9ns p75=89.81ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 208.5,
            "range": "± 3.33 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=208.5ns p75=211.83ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 282.67,
            "range": "± 2.75 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=282.67ns p75=285.42ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 338.63,
            "range": "± 2.43 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=338.63ns p75=341.06ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 268.88,
            "range": "± 1.24 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=268.88ns p75=270.11ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 204.44,
            "range": "± 0.93 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=204.44ns p75=205.38ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 496.48,
            "range": "± 2.61 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=496.48ns p75=499.1ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 222.1,
            "range": "± 0.9 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=222.1ns p75=223ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 253.25,
            "range": "± 1.25 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=253.25ns p75=254.51ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 516.18,
            "range": "± 2.94 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=516.18ns p75=519.12ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1151.51,
            "range": "± 5.82 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1151.51ns p75=1157.34ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 144.15,
            "range": "± 0.99 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=144.15ns p75=145.13ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 221.25,
            "range": "± 2.92 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=221.25ns p75=224.17ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 140.44,
            "range": "± 6.26 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=140.44ns p75=146.7ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 294.17,
            "range": "± 3.1 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=294.17ns p75=297.27ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 429.11,
            "range": "± 1.96 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=429.11ns p75=431.07ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 234.41,
            "range": "± 1.7 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=234.41ns p75=236.11ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 357.69,
            "range": "± 3.13 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=357.69ns p75=360.81ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 160.02,
            "range": "± 0.81 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=160.02ns p75=160.82ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 432.51,
            "range": "± 2.93 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=432.51ns p75=435.44ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 735.69,
            "range": "± 9.01 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=735.69ns p75=744.7ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 701.33,
            "range": "± 7.11 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=701.33ns p75=708.43ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 601.49,
            "range": "± 3.27 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=601.49ns p75=604.76ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 450.85,
            "range": "± 2.72 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=450.85ns p75=453.58ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1039.52,
            "range": "± 5.97 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1039.52ns p75=1045.49ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 481.78,
            "range": "± 2.61 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=481.78ns p75=484.39ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 583.62,
            "range": "± 3.8 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=583.62ns p75=587.41ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1256.39,
            "range": "± 7.47 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1256.39ns p75=1263.85ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2628.32,
            "range": "± 23.47 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2628.32ns p75=2651.78ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 288.22,
            "range": "± 2.83 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=288.22ns p75=291.04ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 512.68,
            "range": "± 4.06 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=512.68ns p75=516.73ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 303.21,
            "range": "± 3.05 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=303.21ns p75=306.25ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 702.23,
            "range": "± 4.97 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=702.23ns p75=707.2ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 1172.31,
            "range": "± 9.85 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=1172.31ns p75=1182.16ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 888.72,
            "range": "± 4.09 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=888.72ns p75=892.81ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1280.78,
            "range": "± 7.3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1280.78ns p75=1288.08ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 941.29,
            "range": "± 4.47 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=941.29ns p75=945.76ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2308.6,
            "range": "± 29.3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2308.6ns p75=2337.89ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 2183.9,
            "range": "± 23.26 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=2183.9ns p75=2207.16ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2343.95,
            "range": "± 20.79 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2343.95ns p75=2364.74ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3592.96,
            "range": "± 29.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3592.96ns p75=3622.85ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 2318.04,
            "range": "± 17.9 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=2318.04ns p75=2335.94ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2731.88,
            "range": "± 22.56 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2731.88ns p75=2754.44ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1247.74,
            "range": "± 9.36 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1247.74ns p75=1257.1ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 7213.38,
            "range": "± 77.12 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=7213.38ns p75=7290.5ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 6170.92,
            "range": "± 78.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=6170.92ns p75=6249.58ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7391.21,
            "range": "± 27.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7391.21ns p75=7418.89ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 9879.98,
            "range": "± 46.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=9879.98ns p75=9926.41ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 26992.69,
            "range": "± 205.61 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=26992.69ns p75=27198.3ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 92271.44,
            "range": "± 628.47 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=92271.44ns p75=92899.91ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 725.5,
            "range": "± 7.73 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=725.5ns p75=733.23ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1616.07,
            "range": "± 8.99 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1616.07ns p75=1625.06ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 9892.95,
            "range": "± 45.12 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=9892.95ns p75=9938.07ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 91420.89,
            "range": "± 406.63 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=91420.89ns p75=91827.51ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1420.41,
            "range": "± 12.09 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1420.41ns p75=1432.5ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4264.92,
            "range": "± 40.8 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4264.92ns p75=4305.72ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 31532.07,
            "range": "± 490.73 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=31532.07ns p75=32022.8ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 315921.2,
            "range": "± 1346.13 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=315921.2ns p75=317267.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1313.59,
            "range": "± 18.27 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1313.59ns p75=1331.87ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1958.44,
            "range": "± 16.44 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1958.44ns p75=1974.88ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1452.63,
            "range": "± 6.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1452.63ns p75=1459.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 2000.66,
            "range": "± 10.55 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=2000.66ns p75=2011.22ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1389.61,
            "range": "± 10.84 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1389.61ns p75=1400.45ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3228.61,
            "range": "± 19.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3228.61ns p75=3247.74ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 3343.36,
            "range": "± 21.59 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=3343.36ns p75=3364.95ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3520.2,
            "range": "± 17.38 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3520.2ns p75=3537.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4596.31,
            "range": "± 19.13 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4596.31ns p75=4615.44ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 3192.94,
            "range": "± 23.14 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=3192.94ns p75=3216.08ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4155.65,
            "range": "± 29.68 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4155.65ns p75=4185.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2210.79,
            "range": "± 20.92 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2210.79ns p75=2231.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 8260.73,
            "range": "± 32.59 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=8260.73ns p75=8293.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 8109.56,
            "range": "± 56.73 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=8109.56ns p75=8166.3ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10566.94,
            "range": "± 15.28 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10566.94ns p75=10582.23ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 10514.47,
            "range": "± 24.31 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=10514.47ns p75=10538.78ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 28347.92,
            "range": "± 20.18 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=28347.92ns p75=28368.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 91451.46,
            "range": "± 324.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=91451.46ns p75=91775.91ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1140.03,
            "range": "± 9.62 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1140.03ns p75=1149.65ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1796.61,
            "range": "± 12.53 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1796.61ns p75=1809.14ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1310.12,
            "range": "± 14.51 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1310.12ns p75=1324.63ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1857.15,
            "range": "± 6.93 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1857.15ns p75=1864.08ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1261.81,
            "range": "± 13.86 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1261.81ns p75=1275.68ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3161.27,
            "range": "± 15.48 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3161.27ns p75=3176.76ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 3125.42,
            "range": "± 32.33 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=3125.42ns p75=3157.74ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3417.49,
            "range": "± 58.71 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3417.49ns p75=3476.21ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4837.06,
            "range": "± 46.26 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4837.06ns p75=4883.31ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4028.4,
            "range": "± 28.59 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4028.4ns p75=4057ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1984.31,
            "range": "± 30.65 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1984.31ns p75=2014.95ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10333.74,
            "range": "± 47.23 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10333.74ns p75=10380.97ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 11669.31,
            "range": "± 13.24 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=11669.31ns p75=11682.55ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 29174.01,
            "range": "± 63.92 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=29174.01ns p75=29237.93ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 100586.29,
            "range": "± 215.48 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=100586.29ns p75=100801.78ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "b90cea7e17715e52638f006690b990d68c53b844",
          "message": "chore: add issue and PR templates #162\n\nAdded `.github/ISSUE_TEMPLATE/bug.yml` collecting notation, expected vs actual behavior, version, surface, and optional context, prefilled with a `fix: ` title and the `bug` label.\nAdded `.github/ISSUE_TEMPLATE/feature.yml` with required description and rationale fields, prefilled with a `feat: ` title and the `feature` label.\nAdded `.github/ISSUE_TEMPLATE/config.yml` keeping blank issues enabled and linking private security advisory reporting.\nAdded `.github/PULL_REQUEST_TEMPLATE.md` as a comment-guided skeleton matching the documented PR body format.\nCross-linked the issue forms and PR template from `CONTRIBUTING.md`.",
          "timestamp": "2026-08-02T19:10:30+03:00",
          "tree_id": "a465e72713697bfc2a15837943054c5a0e0389ab",
          "url": "https://github.com/edloidas/roll-parser/commit/b90cea7e17715e52638f006690b990d68c53b844"
        },
        "date": 1785687233604,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 127.62,
            "range": "± 4.51 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=127.62ns p75=132.14ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 150.16,
            "range": "± 0.76 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=150.16ns p75=150.92ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 98.2,
            "range": "± 3.14 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=98.2ns p75=101.34ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 136.94,
            "range": "± 1.34 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=136.94ns p75=138.28ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 71.3,
            "range": "± 51.45 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=71.3ns p75=122.75ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 167.39,
            "range": "± 0.99 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=167.39ns p75=168.38ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 231.37,
            "range": "± 0.96 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=231.37ns p75=232.33ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 270.81,
            "range": "± 1.37 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=270.81ns p75=272.18ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 213.28,
            "range": "± 0.92 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=213.28ns p75=214.21ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 166.19,
            "range": "± 1.31 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=166.19ns p75=167.51ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 380.74,
            "range": "± 1.91 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=380.74ns p75=382.65ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 171.26,
            "range": "± 0.57 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=171.26ns p75=171.83ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 203.26,
            "range": "± 0.88 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=203.26ns p75=204.14ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 416.65,
            "range": "± 1.61 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=416.65ns p75=418.26ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 897.44,
            "range": "± 3.06 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=897.44ns p75=900.5ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 110.25,
            "range": "± 2.37 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=110.25ns p75=112.63ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 177.45,
            "range": "± 0.58 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=177.45ns p75=178.02ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 109.83,
            "range": "± 3.98 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=109.83ns p75=113.81ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 215.24,
            "range": "± 0.59 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=215.24ns p75=215.83ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 300.04,
            "range": "± 1.84 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=300.04ns p75=301.88ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 186.01,
            "range": "± 1.37 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=186.01ns p75=187.38ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 277.13,
            "range": "± 2.38 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=277.13ns p75=279.51ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 121.13,
            "range": "± 1.14 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=121.13ns p75=122.27ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 317.81,
            "range": "± 1.65 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=317.81ns p75=319.47ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 540.33,
            "range": "± 1.79 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=540.33ns p75=542.12ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 511.34,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=511.34ns p75=513.12ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 422.53,
            "range": "± 1.43 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=422.53ns p75=423.96ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 323.05,
            "range": "± 1.88 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=323.05ns p75=324.93ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 742.46,
            "range": "± 3.85 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=742.46ns p75=746.31ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 326.54,
            "range": "± 1.59 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=326.54ns p75=328.13ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 410.46,
            "range": "± 1.72 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=410.46ns p75=412.18ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 937.86,
            "range": "± 3.79 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=937.86ns p75=941.66ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2090.81,
            "range": "± 11.47 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2090.81ns p75=2102.28ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 217.58,
            "range": "± 1.3 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=217.58ns p75=218.88ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 370.77,
            "range": "± 1.71 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=370.77ns p75=372.48ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 227.04,
            "range": "± 1.07 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=227.04ns p75=228.11ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 470.16,
            "range": "± 2.5 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=470.16ns p75=472.66ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 813.71,
            "range": "± 4.87 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=813.71ns p75=818.58ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 619.31,
            "range": "± 3.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=619.31ns p75=622.75ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 911.99,
            "range": "± 5.55 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=911.99ns p75=917.54ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 694.66,
            "range": "± 6.31 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=694.66ns p75=700.97ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1879.25,
            "range": "± 9.15 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1879.25ns p75=1888.4ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 1769.03,
            "range": "± 10.46 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=1769.03ns p75=1779.49ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1905.5,
            "range": "± 9.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1905.5ns p75=1915.18ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2960.71,
            "range": "± 19.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2960.71ns p75=2979.99ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1865.35,
            "range": "± 11.37 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1865.35ns p75=1876.72ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2073.48,
            "range": "± 10.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2073.48ns p75=2084.14ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 914,
            "range": "± 5.26 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=914ns p75=919.25ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 5967.73,
            "range": "± 19.88 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=5967.73ns p75=5987.61ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 4890.99,
            "range": "± 25.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=4890.99ns p75=4916.43ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 5856.42,
            "range": "± 25.61 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=5856.42ns p75=5882.03ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 8518.42,
            "range": "± 35.05 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=8518.42ns p75=8553.47ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 23738.96,
            "range": "± 41.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=23738.96ns p75=23780.74ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 79137.79,
            "range": "± 274.04 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=79137.79ns p75=79411.83ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 507.1,
            "range": "± 3.81 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=507.1ns p75=510.91ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1306,
            "range": "± 6.21 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1306ns p75=1312.2ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8493.16,
            "range": "± 20.61 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8493.16ns p75=8513.77ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 78708.5,
            "range": "± 171.12 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=78708.5ns p75=78879.62ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1083.69,
            "range": "± 5.87 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1083.69ns p75=1089.56ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3598.82,
            "range": "± 14.16 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3598.82ns p75=3612.98ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 25649.19,
            "range": "± 20.33 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=25649.19ns p75=25669.52ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 269486.87,
            "range": "± 469.39 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=269486.87ns p75=269956.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1011.09,
            "range": "± 33.03 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1011.09ns p75=1044.12ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1547.4,
            "range": "± 9.03 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1547.4ns p75=1556.43ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1125.67,
            "range": "± 6.49 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1125.67ns p75=1132.16ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1573.38,
            "range": "± 4.41 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1573.38ns p75=1577.78ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1066.63,
            "range": "± 5.05 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1066.63ns p75=1071.68ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2602.18,
            "range": "± 10.62 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2602.18ns p75=2612.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 2623.01,
            "range": "± 9.08 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=2623.01ns p75=2632.08ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 2804.94,
            "range": "± 14.47 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=2804.94ns p75=2819.41ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 3767.62,
            "range": "± 21.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=3767.62ns p75=3789.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2516.04,
            "range": "± 11.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2516.04ns p75=2527.39ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3171.91,
            "range": "± 20.37 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3171.91ns p75=3192.28ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1779.51,
            "range": "± 20.96 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1779.51ns p75=1800.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 6760.3,
            "range": "± 14.84 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=6760.3ns p75=6775.15ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 6099.21,
            "range": "± 30.08 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=6099.21ns p75=6129.29ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 8416.48,
            "range": "± 22.61 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=8416.48ns p75=8439.08ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 8929.67,
            "range": "± 26.01 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=8929.67ns p75=8955.68ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 24063.32,
            "range": "± 29.19 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=24063.32ns p75=24092.51ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 78317.33,
            "range": "± 78.21 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=78317.33ns p75=78395.54ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 896.14,
            "range": "± 7.54 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=896.14ns p75=903.67ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1435.34,
            "range": "± 7.88 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1435.34ns p75=1443.21ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1026.22,
            "range": "± 9.2 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1026.22ns p75=1035.42ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1469.93,
            "range": "± 5.85 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1469.93ns p75=1475.78ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 996.09,
            "range": "± 7.14 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=996.09ns p75=1003.23ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2546.5,
            "range": "± 10.75 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2546.5ns p75=2557.25ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 2521.92,
            "range": "± 14.55 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=2521.92ns p75=2536.47ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 2745.24,
            "range": "± 19.54 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=2745.24ns p75=2764.78ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4139.29,
            "range": "± 21.62 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4139.29ns p75=4160.91ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3125.81,
            "range": "± 15.19 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3125.81ns p75=3141ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1640.66,
            "range": "± 19.62 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1640.66ns p75=1660.29ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 8428.26,
            "range": "± 29.11 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=8428.26ns p75=8457.37ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 9943.31,
            "range": "± 36.6 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=9943.31ns p75=9979.92ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 24914.92,
            "range": "± 20.54 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=24914.92ns p75=24935.45ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 86686.08,
            "range": "± 92.66 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=86686.08ns p75=86778.75ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fa0f849de9c3cbf29d12d9198eca98f8e7c781e8",
          "message": "feat: replace djb2 seeding with cyrb128 full-state hashing #201 (#206)\n\nReplaced `hashString` (djb2) and the splitmix32 state expansion with cyrb128,\nwhich hashes the seed into all four state words at once\nStringified numeric seeds so all 53 bits reach the hash, removing the\n`seed >>> 0` truncation that aliased `0`, `2**40` and `-1`, `2**53 - 1`\nReduced `WARMUP_DRAWS` from 20 to 8 now that the state comes from a single\n128-bit hash rather than a one-uint32 expansion\nRe-pinned the golden vectors, CLI seeded outputs, README fences and TSDoc\nexamples against the new sequences\n\nCo-authored-by: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-02T20:15:50+03:00",
          "tree_id": "947cd1d6a409165068145d99398e6e55d3d20b7e",
          "url": "https://github.com/edloidas/roll-parser/commit/fa0f849de9c3cbf29d12d9198eca98f8e7c781e8"
        },
        "date": 1785691160361,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 166.21,
            "range": "± 3.66 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=166.21ns p75=169.88ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 190.58,
            "range": "± 1.9 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=190.58ns p75=192.47ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 130.69,
            "range": "± 1.94 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=130.69ns p75=132.63ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 174.92,
            "range": "± 1.16 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=174.92ns p75=176.09ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 88.42,
            "range": "± 4.19 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=88.42ns p75=92.6ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 215.14,
            "range": "± 1.77 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=215.14ns p75=216.9ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 299.58,
            "range": "± 3.86 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=299.58ns p75=303.44ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 350.59,
            "range": "± 42.8 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=350.59ns p75=393.39ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 274.45,
            "range": "± 5.94 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=274.45ns p75=280.39ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 212.26,
            "range": "± 1.27 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=212.26ns p75=213.53ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 494.7,
            "range": "± 3.05 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=494.7ns p75=497.75ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 221.12,
            "range": "± 0.86 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=221.12ns p75=221.97ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 264.2,
            "range": "± 1.32 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=264.2ns p75=265.51ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 545.39,
            "range": "± 3.22 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=545.39ns p75=548.61ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1178.04,
            "range": "± 5.19 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1178.04ns p75=1183.23ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 150.47,
            "range": "± 0.92 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=150.47ns p75=151.4ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 233.85,
            "range": "± 1.49 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=233.85ns p75=235.34ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 145.54,
            "range": "± 4.44 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=145.54ns p75=149.98ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 281.59,
            "range": "± 2.27 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=281.59ns p75=283.86ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 399.42,
            "range": "± 1.83 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=399.42ns p75=401.26ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 239.76,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=239.76ns p75=241.54ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 358.86,
            "range": "± 3.5 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=358.86ns p75=362.36ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 157.18,
            "range": "± 4.61 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=157.18ns p75=161.79ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 405.34,
            "range": "± 2.71 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=405.34ns p75=408.05ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 707.26,
            "range": "± 3.58 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=707.26ns p75=710.84ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 655.38,
            "range": "± 6.82 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=655.38ns p75=662.2ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 542.74,
            "range": "± 3.67 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=542.74ns p75=546.41ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 417.83,
            "range": "± 1.57 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=417.83ns p75=419.4ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 993.45,
            "range": "± 4.8 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=993.45ns p75=998.26ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 448.55,
            "range": "± 2.92 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=448.55ns p75=451.47ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 506.55,
            "range": "± 3 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=506.55ns p75=509.56ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1170.71,
            "range": "± 3.44 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1170.71ns p75=1174.15ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2761.53,
            "range": "± 6.22 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2761.53ns p75=2767.75ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 276.85,
            "range": "± 2.17 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=276.85ns p75=279.01ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 460.95,
            "range": "± 2.67 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=460.95ns p75=463.62ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 282.84,
            "range": "± 2.36 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=282.84ns p75=285.19ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 541.67,
            "range": "± 5.93 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=541.67ns p75=547.61ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 974.32,
            "range": "± 16.9 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=974.32ns p75=991.22ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 661.76,
            "range": "± 3.27 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=661.76ns p75=665.03ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1091.18,
            "range": "± 6.07 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1091.18ns p75=1097.25ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 714.52,
            "range": "± 3.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=714.52ns p75=717.95ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 2193.22,
            "range": "± 11.59 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=2193.22ns p75=2204.81ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 2195.72,
            "range": "± 18.64 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=2195.72ns p75=2214.36ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 2329.55,
            "range": "± 15.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=2329.55ns p75=2344.77ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 3401.63,
            "range": "± 16.13 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=3401.63ns p75=3417.76ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1788.43,
            "range": "± 13.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1788.43ns p75=1802.32ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2790.97,
            "range": "± 21.13 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2790.97ns p75=2812.1ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1115.66,
            "range": "± 11.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1115.66ns p75=1126.84ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 5045.29,
            "range": "± 49.77 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=5045.29ns p75=5095.07ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5987.93,
            "range": "± 156.35 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5987.93ns p75=6144.28ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 7664.17,
            "range": "± 43.97 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=7664.17ns p75=7708.14ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 9042.09,
            "range": "± 25.76 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=9042.09ns p75=9067.85ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 26520.46,
            "range": "± 164.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=26520.46ns p75=26684.69ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 83130.19,
            "range": "± 706.45 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=83130.19ns p75=83836.64ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 529.58,
            "range": "± 4.72 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=529.58ns p75=534.29ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1323.75,
            "range": "± 9.73 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1323.75ns p75=1333.48ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 8906.81,
            "range": "± 34.3 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=8906.81ns p75=8941.11ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 82495.77,
            "range": "± 227.78 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=82495.77ns p75=82723.54ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1269.53,
            "range": "± 7.46 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1269.53ns p75=1276.98ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 4126.07,
            "range": "± 28.97 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=4126.07ns p75=4155.03ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 29247.34,
            "range": "± 85.31 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=29247.34ns p75=29332.64ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 306940.8,
            "range": "± 273.67 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=306940.8ns p75=307214.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1202.13,
            "range": "± 12.3 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1202.13ns p75=1214.43ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1944.45,
            "range": "± 13.34 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1944.45ns p75=1957.79ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1328.03,
            "range": "± 12.8 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1328.03ns p75=1340.83ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1997.18,
            "range": "± 124.9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1997.18ns p75=2122.09ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1219.88,
            "range": "± 5.72 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1219.88ns p75=1225.6ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 3092.04,
            "range": "± 23.23 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=3092.04ns p75=3115.27ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 3326.29,
            "range": "± 23.04 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=3326.29ns p75=3349.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3566.35,
            "range": "± 12.11 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3566.35ns p75=3578.46ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 4469.59,
            "range": "± 18.46 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=4469.59ns p75=4488.05ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2747.27,
            "range": "± 15.01 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2747.27ns p75=2762.28ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 4167.76,
            "range": "± 16.21 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=4167.76ns p75=4183.97ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 2166.93,
            "range": "± 21.07 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=2166.93ns p75=2188ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 6358.19,
            "range": "± 30.95 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=6358.19ns p75=6389.13ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7793.75,
            "range": "± 52.35 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7793.75ns p75=7846.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 11377.81,
            "range": "± 34.92 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=11377.81ns p75=11412.73ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 9649.1,
            "range": "± 30.7 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=9649.1ns p75=9679.8ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 27032.59,
            "range": "± 37.04 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=27032.59ns p75=27069.62ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 83269,
            "range": "± 131.96 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=83269ns p75=83400.96ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1094.57,
            "range": "± 13.47 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1094.57ns p75=1108.04ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1874.15,
            "range": "± 10.35 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1874.15ns p75=1884.49ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1234.06,
            "range": "± 10.39 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1234.06ns p75=1244.45ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1923.76,
            "range": "± 17.88 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1923.76ns p75=1941.64ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1168.44,
            "range": "± 13.03 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1168.44ns p75=1181.47ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 3158.03,
            "range": "± 8.4 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=3158.03ns p75=3166.42ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 3269.91,
            "range": "± 10.49 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=3269.91ns p75=3280.4ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3532.77,
            "range": "± 22.94 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3532.77ns p75=3555.71ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4845.28,
            "range": "± 15.45 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4845.28ns p75=4860.73ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 4138.26,
            "range": "± 42.58 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=4138.26ns p75=4180.84ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 2136.99,
            "range": "± 13.08 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=2136.99ns p75=2150.08ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 11229.82,
            "range": "± 22.8 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=11229.82ns p75=11252.62ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 11011.55,
            "range": "± 19.9 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=11011.55ns p75=11031.45ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 28498.24,
            "range": "± 55.08 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=28498.24ns p75=28553.32ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 94458.76,
            "range": "± 66.01 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=94458.76ns p75=94524.77ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "3c9e23e9bdfc50e6d55192170c6eae241ce3eabb",
          "message": "feat: swap xorshift128 core for xoshiro128** #202\n\nReplaced the xorshift128 core in `nextUint32()` with xoshiro128** 1.0, keeping\nthe four-word state shape; `nextInt` and `nextBoundedWide` are untouched\nStored the state words as signed int32 rather than normalizing with `>>> 0` on\nwrite — the bit patterns and output sequence are identical, but a word above\n2^31 leaves V8's Smi field representation and roughly doubles per-draw cost\nRe-pinned the golden vectors, CLI seeded outputs, README fences and TSDoc\nexamples against the new sequences\n\nVerified the generator against the C reference: from state [1, 2, 3, 4] it\nemits 11520, 0, 5927040. `{ roll }` grew 40 B against an 11.5 kB budget. Both\nbench suites came out 2-16% faster rather than slower — the old xorshift wrote\nuint32 into its state fields and paid the same Smi penalty the signed words now\navoid.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-02T22:45:40+03:00",
          "tree_id": "2c83ee3ad127da1cf1cb41947d453e2ace970723",
          "url": "https://github.com/edloidas/roll-parser/commit/3c9e23e9bdfc50e6d55192170c6eae241ce3eabb"
        },
        "date": 1785700145017,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 143.11,
            "range": "± 13.37 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=143.11ns p75=156.48ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 186.55,
            "range": "± 1.76 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=186.55ns p75=188.31ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 123.89,
            "range": "± 2.24 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=123.89ns p75=126.13ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 167.07,
            "range": "± 1.97 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=167.07ns p75=169.04ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 84.28,
            "range": "± 4.76 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=84.28ns p75=89.04ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 206.39,
            "range": "± 0.91 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=206.39ns p75=207.29ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 279.2,
            "range": "± 2.3 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=279.2ns p75=281.5ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 336.93,
            "range": "± 2.18 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=336.93ns p75=339.11ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 265.18,
            "range": "± 1.68 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=265.18ns p75=266.86ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 203,
            "range": "± 0.8 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=203ns p75=203.8ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 495.26,
            "range": "± 18.65 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=495.26ns p75=513.91ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 212.14,
            "range": "± 1.39 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=212.14ns p75=213.53ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 248.57,
            "range": "± 1.59 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=248.57ns p75=250.16ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 513.47,
            "range": "± 3.07 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=513.47ns p75=516.55ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1191.36,
            "range": "± 4.93 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1191.36ns p75=1196.29ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 140.19,
            "range": "± 2.34 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=140.19ns p75=142.53ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 219.47,
            "range": "± 0.8 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=219.47ns p75=220.28ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 141.74,
            "range": "± 1.94 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=141.74ns p75=143.68ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 286.81,
            "range": "± 3.99 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=286.81ns p75=290.81ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 428.64,
            "range": "± 2.44 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=428.64ns p75=431.08ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 233.76,
            "range": "± 1.13 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=233.76ns p75=234.89ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 377.45,
            "range": "± 2.38 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=377.45ns p75=379.84ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 155.96,
            "range": "± 1.26 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=155.96ns p75=157.22ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 437.45,
            "range": "± 1.82 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=437.45ns p75=439.27ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 737.12,
            "range": "± 6.2 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=737.12ns p75=743.31ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 705.6,
            "range": "± 5.17 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=705.6ns p75=710.77ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 596.1,
            "range": "± 3.67 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=596.1ns p75=599.77ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 455.72,
            "range": "± 1.62 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=455.72ns p75=457.34ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1028.55,
            "range": "± 7.82 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1028.55ns p75=1036.37ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 473.66,
            "range": "± 2.72 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=473.66ns p75=476.39ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 590.3,
            "range": "± 3.17 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=590.3ns p75=593.46ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1247.69,
            "range": "± 6.42 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1247.69ns p75=1254.12ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2650.41,
            "range": "± 11.21 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2650.41ns p75=2661.62ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 302.62,
            "range": "± 2.15 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=302.62ns p75=304.76ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 509.69,
            "range": "± 3.12 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=509.69ns p75=512.81ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 313.81,
            "range": "± 2.63 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=313.81ns p75=316.44ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 450.4,
            "range": "± 3.24 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=450.4ns p75=453.64ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 843.86,
            "range": "± 6.11 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=843.86ns p75=849.98ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 572.2,
            "range": "± 3.67 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=572.2ns p75=575.87ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 923.84,
            "range": "± 5.45 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=923.84ns p75=929.29ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 647.73,
            "range": "± 4.49 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=647.73ns p75=652.22ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1838.25,
            "range": "± 12.23 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1838.25ns p75=1850.49ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 1837.25,
            "range": "± 11.08 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=1837.25ns p75=1848.32ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1964.65,
            "range": "± 24.41 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1964.65ns p75=1989.06ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2850.5,
            "range": "± 28.32 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2850.5ns p75=2878.82ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1794.08,
            "range": "± 15.59 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1794.08ns p75=1809.66ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2336.85,
            "range": "± 19.29 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2336.85ns p75=2356.13ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 947.11,
            "range": "± 4.66 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=947.11ns p75=951.76ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 4613.99,
            "range": "± 35.45 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=4613.99ns p75=4649.45ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5346.53,
            "range": "± 46.47 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5346.53ns p75=5393ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 6822.34,
            "range": "± 49.68 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=6822.34ns p75=6872.02ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 6502.21,
            "range": "± 33.55 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=6502.21ns p75=6535.76ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 21018.27,
            "range": "± 61.67 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=21018.27ns p75=21079.93ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 58531.9,
            "range": "± 269.02 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=58531.9ns p75=58800.93ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 475.5,
            "range": "± 4.01 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=475.5ns p75=479.51ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1123.04,
            "range": "± 6.49 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1123.04ns p75=1129.53ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 6547.44,
            "range": "± 12 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=6547.44ns p75=6559.43ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 58297.72,
            "range": "± 56.63 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=58297.72ns p75=58354.34ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1064.49,
            "range": "± 10.88 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1064.49ns p75=1075.37ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3526.21,
            "range": "± 33.41 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3526.21ns p75=3559.62ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 24974.07,
            "range": "± 33.28 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=24974.07ns p75=25007.35ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 257247.35,
            "range": "± 265.83 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=257247.35ns p75=257513.18ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1075.32,
            "range": "± 29.26 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1075.32ns p75=1104.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1631.14,
            "range": "± 16.57 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1631.14ns p75=1647.71ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1127.47,
            "range": "± 6.55 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1127.47ns p75=1134.02ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1668.72,
            "range": "± 10.9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1668.72ns p75=1679.62ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1038.79,
            "range": "± 14.43 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1038.79ns p75=1053.22ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2727.39,
            "range": "± 14.83 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2727.39ns p75=2742.21ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 2970.53,
            "range": "± 18.9 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=2970.53ns p75=2989.44ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3157.3,
            "range": "± 22.8 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3157.3ns p75=3180.1ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 3909.94,
            "range": "± 27.87 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=3909.94ns p75=3937.81ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2721.66,
            "range": "± 27.93 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2721.66ns p75=2749.59ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3830.06,
            "range": "± 48.31 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3830.06ns p75=3878.37ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1810.19,
            "range": "± 27.14 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1810.19ns p75=1837.33ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 5760.91,
            "range": "± 32.77 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=5760.91ns p75=5793.68ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7180.25,
            "range": "± 54.03 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7180.25ns p75=7234.29ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10010.7,
            "range": "± 30.75 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10010.7ns p75=10041.45ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 7093.29,
            "range": "± 31.36 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=7093.29ns p75=7124.65ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 22681.12,
            "range": "± 17.15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=22681.12ns p75=22698.26ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 58801.22,
            "range": "± 80.17 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=58801.22ns p75=58881.39ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1014.9,
            "range": "± 9.08 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1014.9ns p75=1023.98ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1594.44,
            "range": "± 16.93 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1594.44ns p75=1611.36ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1102.74,
            "range": "± 10.28 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1102.74ns p75=1113.01ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1636.27,
            "range": "± 15.61 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1636.27ns p75=1651.88ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1011.24,
            "range": "± 8.3 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1011.24ns p75=1019.54ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2699.86,
            "range": "± 25.99 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2699.86ns p75=2725.85ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 2925.87,
            "range": "± 25.09 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=2925.87ns p75=2950.96ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3120.65,
            "range": "± 39.09 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3120.65ns p75=3159.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4195.43,
            "range": "± 53.67 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4195.43ns p75=4249.1ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3883.15,
            "range": "± 65.27 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3883.15ns p75=3948.42ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1869.06,
            "range": "± 12.74 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1869.06ns p75=1881.81ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10215.13,
            "range": "± 39.14 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10215.13ns p75=10254.28ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 7512.47,
            "range": "± 18.04 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=7512.47ns p75=7530.51ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 22893.48,
            "range": "± 83.89 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=22893.48ns p75=22977.37ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 60808.2,
            "range": "± 486.44 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=60808.2ns p75=61294.65ns mode=batch"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "committer": {
            "email": "edloidas@gmail.com",
            "name": "Mikita Taukachou",
            "username": "edloidas"
          },
          "distinct": true,
          "id": "3921162083d0bff4a759add344cba295cce1a8a8",
          "message": "feat: add RNG state export and restore #203\n\nAdded `SeededRNG.state()`, returning the four engine words as unsigned int32\nAdded the `RngState` tuple type, exported from the package root\nWidened the constructor to `string | number | RngState`; a state input copies\nthe words verbatim, skipping both the cyrb128 hash and the warm-up draws so a\nrestore resumes the exact sequence\nExtracted the all-zero fixed-point guard into `guardZeroState()`, shared by the\nseed and restore paths\nDocumented replay, save/resume, and per-entity substreams as README recipes and\nTSDoc examples\nLeft the `RNG` interface untouched — state is a `SeededRNG` capability, not part\nof the injectable contract\n\nRestore normalizes with `| 0` rather than the `>>> 0` the issue names: the state\nwords are stored signed on purpose (a word above 2^31 leaves V8's Smi\nrepresentation and roughly doubles per-draw cost), the bit patterns are\nidentical, and `state()` widens at the boundary. Malformed tuples stay coerced\nrather than validated, per the issue's stated decision — Codex flagged the\npermissive constructor; the docs now scope the exactness guarantee to snapshots\n`state()` produced instead of adding a validator.\n\n`{ roll }` grew 70 B against an 11.5 kB budget and `index.js` 80 B against\n12 kB; `{ parse }` and `testing.js` did not move. `bench:roll` unchanged — no\nhot-path edit.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>",
          "timestamp": "2026-08-02T23:21:55+03:00",
          "tree_id": "af99479f373615ec757e3270256b8d8a304359f0",
          "url": "https://github.com/edloidas/roll-parser/commit/3921162083d0bff4a759add344cba295cce1a8a8"
        },
        "date": 1785702302730,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "lex / 1d20",
            "value": 145.68,
            "range": "± 7.24 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20 p50=145.68ns p75=152.91ns mode=batch"
          },
          {
            "name": "lex / 1d20+5",
            "value": 191.38,
            "range": "± 1.6 ns",
            "unit": "ns",
            "extra": "group=lex case=1d20+5 p50=191.38ns p75=192.98ns mode=batch"
          },
          {
            "name": "lex / 3d6",
            "value": 125.76,
            "range": "± 2.73 ns",
            "unit": "ns",
            "extra": "group=lex case=3d6 p50=125.76ns p75=128.49ns mode=batch"
          },
          {
            "name": "lex / 2d6+3",
            "value": 170.14,
            "range": "± 2.51 ns",
            "unit": "ns",
            "extra": "group=lex case=2d6+3 p50=170.14ns p75=172.65ns mode=batch"
          },
          {
            "name": "lex / 4dF",
            "value": 89.12,
            "range": "± 2.85 ns",
            "unit": "ns",
            "extra": "group=lex case=4dF p50=89.12ns p75=91.97ns mode=batch"
          },
          {
            "name": "lex / 4d6kh3",
            "value": 210.11,
            "range": "± 1.45 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6kh3 p50=210.11ns p75=211.56ns mode=batch"
          },
          {
            "name": "lex / {1d6+2}kh1",
            "value": 285.66,
            "range": "± 2.74 ns",
            "unit": "ns",
            "extra": "group=lex case={1d6+2}kh1 p50=285.66ns p75=288.4ns mode=batch"
          },
          {
            "name": "lex / 2d20kh1 vs 15",
            "value": 342.79,
            "range": "± 2.72 ns",
            "unit": "ns",
            "extra": "group=lex case=2d20kh1 vs 15 p50=342.79ns p75=345.51ns mode=batch"
          },
          {
            "name": "lex / 10d10>=6f1",
            "value": 270.74,
            "range": "± 1.58 ns",
            "unit": "ns",
            "extra": "group=lex case=10d10>=6f1 p50=270.74ns p75=272.31ns mode=batch"
          },
          {
            "name": "lex / 4d6r<2",
            "value": 202.9,
            "range": "± 0.94 ns",
            "unit": "ns",
            "extra": "group=lex case=4d6r<2 p50=202.9ns p75=203.84ns mode=batch"
          },
          {
            "name": "lex / floor((1d4+1)*2/3)",
            "value": 495.24,
            "range": "± 3.06 ns",
            "unit": "ns",
            "extra": "group=lex case=floor((1d4+1)*2/3) p50=495.24ns p75=498.31ns mode=batch"
          },
          {
            "name": "lex / @atk+1d20",
            "value": 214.7,
            "range": "± 1.36 ns",
            "unit": "ns",
            "extra": "group=lex case=@atk+1d20 p50=214.7ns p75=216.06ns mode=batch"
          },
          {
            "name": "lex / 10d6!kh3",
            "value": 254.5,
            "range": "± 1.5 ns",
            "unit": "ns",
            "extra": "group=lex case=10d6!kh3 p50=254.5ns p75=256.01ns mode=batch"
          },
          {
            "name": "lex / {2d20kh1+5, 3d8!}kh1",
            "value": 516.24,
            "range": "± 3.26 ns",
            "unit": "ns",
            "extra": "group=lex case={2d20kh1+5, 3d8!}kh1 p50=516.24ns p75=519.51ns mode=batch"
          },
          {
            "name": "lex / sum-20-terms",
            "value": 1163.48,
            "range": "± 3.83 ns",
            "unit": "ns",
            "extra": "group=lex case=sum-20-terms p50=1163.48ns p75=1167.31ns mode=batch"
          },
          {
            "name": "lex / 100d6",
            "value": 144.43,
            "range": "± 1.32 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6 p50=144.43ns p75=145.75ns mode=batch"
          },
          {
            "name": "lex / 100d6kh1",
            "value": 225.38,
            "range": "± 0.79 ns",
            "unit": "ns",
            "extra": "group=lex case=100d6kh1 p50=225.38ns p75=226.17ns mode=batch"
          },
          {
            "name": "lex / 1000d6",
            "value": 144.12,
            "range": "± 1.74 ns",
            "unit": "ns",
            "extra": "group=lex case=1000d6 p50=144.12ns p75=145.86ns mode=batch"
          },
          {
            "name": "parse / 1d20",
            "value": 286.41,
            "range": "± 2.89 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20 p50=286.41ns p75=289.3ns mode=batch"
          },
          {
            "name": "parse / 1d20+5",
            "value": 427.4,
            "range": "± 1.78 ns",
            "unit": "ns",
            "extra": "group=parse case=1d20+5 p50=427.4ns p75=429.18ns mode=batch"
          },
          {
            "name": "parse / 3d6",
            "value": 238.1,
            "range": "± 1.81 ns",
            "unit": "ns",
            "extra": "group=parse case=3d6 p50=238.1ns p75=239.91ns mode=batch"
          },
          {
            "name": "parse / 2d6+3",
            "value": 371.01,
            "range": "± 2.09 ns",
            "unit": "ns",
            "extra": "group=parse case=2d6+3 p50=371.01ns p75=373.09ns mode=batch"
          },
          {
            "name": "parse / 4dF",
            "value": 152.97,
            "range": "± 3.01 ns",
            "unit": "ns",
            "extra": "group=parse case=4dF p50=152.97ns p75=155.98ns mode=batch"
          },
          {
            "name": "parse / 4d6kh3",
            "value": 440.92,
            "range": "± 1.76 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6kh3 p50=440.92ns p75=442.68ns mode=batch"
          },
          {
            "name": "parse / {1d6+2}kh1",
            "value": 744.33,
            "range": "± 6.5 ns",
            "unit": "ns",
            "extra": "group=parse case={1d6+2}kh1 p50=744.33ns p75=750.83ns mode=batch"
          },
          {
            "name": "parse / 2d20kh1 vs 15",
            "value": 739.18,
            "range": "± 5.13 ns",
            "unit": "ns",
            "extra": "group=parse case=2d20kh1 vs 15 p50=739.18ns p75=744.31ns mode=batch"
          },
          {
            "name": "parse / 10d10>=6f1",
            "value": 609.66,
            "range": "± 2.39 ns",
            "unit": "ns",
            "extra": "group=parse case=10d10>=6f1 p50=609.66ns p75=612.05ns mode=batch"
          },
          {
            "name": "parse / 4d6r<2",
            "value": 446.62,
            "range": "± 1.82 ns",
            "unit": "ns",
            "extra": "group=parse case=4d6r<2 p50=446.62ns p75=448.45ns mode=batch"
          },
          {
            "name": "parse / floor((1d4+1)*2/3)",
            "value": 1031.13,
            "range": "± 9.33 ns",
            "unit": "ns",
            "extra": "group=parse case=floor((1d4+1)*2/3) p50=1031.13ns p75=1040.46ns mode=batch"
          },
          {
            "name": "parse / @atk+1d20",
            "value": 476.31,
            "range": "± 2.26 ns",
            "unit": "ns",
            "extra": "group=parse case=@atk+1d20 p50=476.31ns p75=478.57ns mode=batch"
          },
          {
            "name": "parse / 10d6!kh3",
            "value": 595.87,
            "range": "± 2.74 ns",
            "unit": "ns",
            "extra": "group=parse case=10d6!kh3 p50=595.87ns p75=598.61ns mode=batch"
          },
          {
            "name": "parse / {2d20kh1+5, 3d8!}kh1",
            "value": 1258.27,
            "range": "± 5.59 ns",
            "unit": "ns",
            "extra": "group=parse case={2d20kh1+5, 3d8!}kh1 p50=1258.27ns p75=1263.87ns mode=batch"
          },
          {
            "name": "parse / sum-20-terms",
            "value": 2604.92,
            "range": "± 8.68 ns",
            "unit": "ns",
            "extra": "group=parse case=sum-20-terms p50=2604.92ns p75=2613.6ns mode=batch"
          },
          {
            "name": "parse / 100d6",
            "value": 314.32,
            "range": "± 2.23 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6 p50=314.32ns p75=316.56ns mode=batch"
          },
          {
            "name": "parse / 100d6kh1",
            "value": 526.06,
            "range": "± 3.01 ns",
            "unit": "ns",
            "extra": "group=parse case=100d6kh1 p50=526.06ns p75=529.07ns mode=batch"
          },
          {
            "name": "parse / 1000d6",
            "value": 314.15,
            "range": "± 3.27 ns",
            "unit": "ns",
            "extra": "group=parse case=1000d6 p50=314.15ns p75=317.42ns mode=batch"
          },
          {
            "name": "evaluate / 1d20",
            "value": 510.65,
            "range": "± 3.05 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20 p50=510.65ns p75=513.7ns mode=batch"
          },
          {
            "name": "evaluate / 1d20+5",
            "value": 929.42,
            "range": "± 4.29 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1d20+5 p50=929.42ns p75=933.7ns mode=batch"
          },
          {
            "name": "evaluate / 3d6",
            "value": 642.2,
            "range": "± 2.65 ns",
            "unit": "ns",
            "extra": "group=evaluate case=3d6 p50=642.2ns p75=644.86ns mode=batch"
          },
          {
            "name": "evaluate / 2d6+3",
            "value": 1003.64,
            "range": "± 4.57 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d6+3 p50=1003.64ns p75=1008.21ns mode=batch"
          },
          {
            "name": "evaluate / 4dF",
            "value": 684.33,
            "range": "± 3 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4dF p50=684.33ns p75=687.33ns mode=batch"
          },
          {
            "name": "evaluate / 4d6kh3",
            "value": 1833.08,
            "range": "± 17.4 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6kh3 p50=1833.08ns p75=1850.49ns mode=batch"
          },
          {
            "name": "evaluate / {1d6+2}kh1",
            "value": 1837.79,
            "range": "± 14.92 ns",
            "unit": "ns",
            "extra": "group=evaluate case={1d6+2}kh1 p50=1837.79ns p75=1852.7ns mode=batch"
          },
          {
            "name": "evaluate / 2d20kh1 vs 15",
            "value": 1897.94,
            "range": "± 17.83 ns",
            "unit": "ns",
            "extra": "group=evaluate case=2d20kh1 vs 15 p50=1897.94ns p75=1915.77ns mode=batch"
          },
          {
            "name": "evaluate / 10d10>=6f1",
            "value": 2750.96,
            "range": "± 126.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d10>=6f1 p50=2750.96ns p75=2877.85ns mode=batch"
          },
          {
            "name": "evaluate / 4d6r<2",
            "value": 1851.41,
            "range": "± 17.67 ns",
            "unit": "ns",
            "extra": "group=evaluate case=4d6r<2 p50=1851.41ns p75=1869.08ns mode=batch"
          },
          {
            "name": "evaluate / floor((1d4+1)*2/3)",
            "value": 2360.24,
            "range": "± 41.21 ns",
            "unit": "ns",
            "extra": "group=evaluate case=floor((1d4+1)*2/3) p50=2360.24ns p75=2401.46ns mode=batch"
          },
          {
            "name": "evaluate / @atk+1d20",
            "value": 1009.03,
            "range": "± 3.96 ns",
            "unit": "ns",
            "extra": "group=evaluate case=@atk+1d20 p50=1009.03ns p75=1012.99ns mode=batch"
          },
          {
            "name": "evaluate / 10d6!kh3",
            "value": 4616.33,
            "range": "± 27.89 ns",
            "unit": "ns",
            "extra": "group=evaluate case=10d6!kh3 p50=4616.33ns p75=4644.22ns mode=batch"
          },
          {
            "name": "evaluate / {2d20kh1+5, 3d8!}kh1",
            "value": 5146.42,
            "range": "± 79.18 ns",
            "unit": "ns",
            "extra": "group=evaluate case={2d20kh1+5, 3d8!}kh1 p50=5146.42ns p75=5225.59ns mode=batch"
          },
          {
            "name": "evaluate / sum-20-terms",
            "value": 6822.82,
            "range": "± 44.4 ns",
            "unit": "ns",
            "extra": "group=evaluate case=sum-20-terms p50=6822.82ns p75=6867.23ns mode=batch"
          },
          {
            "name": "evaluate / 100d6",
            "value": 6595.25,
            "range": "± 224.79 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6 p50=6595.25ns p75=6820.03ns mode=batch"
          },
          {
            "name": "evaluate / 100d6kh1",
            "value": 18993.03,
            "range": "± 58.31 ns",
            "unit": "ns",
            "extra": "group=evaluate case=100d6kh1 p50=18993.03ns p75=19051.34ns mode=batch"
          },
          {
            "name": "evaluate / 1000d6",
            "value": 58554.34,
            "range": "± 369.44 ns",
            "unit": "ns",
            "extra": "group=evaluate case=1000d6 p50=58554.34ns p75=58923.78ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6",
            "value": 546.85,
            "range": "± 5.06 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6 p50=546.85ns p75=551.91ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6",
            "value": 1172.41,
            "range": "± 13.54 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6 p50=1172.41ns p75=1185.95ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6",
            "value": 6445.37,
            "range": "± 123.7 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6 p50=6445.37ns p75=6569.07ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6",
            "value": 58798.84,
            "range": "± 1280.95 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6 p50=58798.84ns p75=60079.79ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1d6kh(n/2)",
            "value": 1163.78,
            "range": "± 7.88 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1d6kh(n/2) p50=1163.78ns p75=1171.66ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 10d6kh(n/2)",
            "value": 3556.14,
            "range": "± 36.09 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=10d6kh(n/2) p50=3556.14ns p75=3592.23ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 100d6kh(n/2)",
            "value": 24310.87,
            "range": "± 20.42 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=100d6kh(n/2) p50=24310.87ns p75=24331.29ns mode=batch"
          },
          {
            "name": "evaluate — pool scaling / 1000d6kh(n/2)",
            "value": 255574.05,
            "range": "± 996.4 ns",
            "unit": "ns",
            "extra": "group=evaluate — pool scaling case=1000d6kh(n/2) p50=255574.05ns p75=256570.45ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20",
            "value": 1106.39,
            "range": "± 21.4 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20 p50=1106.39ns p75=1127.79ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1d20+5",
            "value": 1756.95,
            "range": "± 10.63 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1d20+5 p50=1756.95ns p75=1767.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / 3d6",
            "value": 1248.71,
            "range": "± 6.43 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=3d6 p50=1248.71ns p75=1255.14ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d6+3",
            "value": 1779.52,
            "range": "± 5.47 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d6+3 p50=1779.52ns p75=1784.99ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4dF",
            "value": 1157.17,
            "range": "± 12.4 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4dF p50=1157.17ns p75=1169.57ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6kh3",
            "value": 2773.47,
            "range": "± 15 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6kh3 p50=2773.47ns p75=2788.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / {1d6+2}kh1",
            "value": 3012.17,
            "range": "± 41.12 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={1d6+2}kh1 p50=3012.17ns p75=3053.3ns mode=batch"
          },
          {
            "name": "roll (seeded) / 2d20kh1 vs 15",
            "value": 3090.42,
            "range": "± 18.04 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=2d20kh1 vs 15 p50=3090.42ns p75=3108.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d10>=6f1",
            "value": 3727.55,
            "range": "± 17.88 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d10>=6f1 p50=3727.55ns p75=3745.43ns mode=batch"
          },
          {
            "name": "roll (seeded) / 4d6r<2",
            "value": 2721.75,
            "range": "± 29.73 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=4d6r<2 p50=2721.75ns p75=2751.47ns mode=batch"
          },
          {
            "name": "roll (seeded) / floor((1d4+1)*2/3)",
            "value": 3818.68,
            "range": "± 27.79 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=floor((1d4+1)*2/3) p50=3818.68ns p75=3846.46ns mode=batch"
          },
          {
            "name": "roll (seeded) / @atk+1d20",
            "value": 1978.66,
            "range": "± 12.68 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=@atk+1d20 p50=1978.66ns p75=1991.34ns mode=batch"
          },
          {
            "name": "roll (seeded) / 10d6!kh3",
            "value": 5862.16,
            "range": "± 86.69 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=10d6!kh3 p50=5862.16ns p75=5948.85ns mode=batch"
          },
          {
            "name": "roll (seeded) / {2d20kh1+5, 3d8!}kh1",
            "value": 7439.24,
            "range": "± 110.34 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case={2d20kh1+5, 3d8!}kh1 p50=7439.24ns p75=7549.58ns mode=batch"
          },
          {
            "name": "roll (seeded) / sum-20-terms",
            "value": 10135.63,
            "range": "± 88.68 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=sum-20-terms p50=10135.63ns p75=10224.3ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6",
            "value": 7314.23,
            "range": "± 78.74 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6 p50=7314.23ns p75=7392.97ns mode=batch"
          },
          {
            "name": "roll (seeded) / 100d6kh1",
            "value": 20813.64,
            "range": "± 184.55 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=100d6kh1 p50=20813.64ns p75=20998.19ns mode=batch"
          },
          {
            "name": "roll (seeded) / 1000d6",
            "value": 59605.81,
            "range": "± 1356.39 ns",
            "unit": "ns",
            "extra": "group=roll (seeded) case=1000d6 p50=59605.81ns p75=60962.2ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20",
            "value": 1056.19,
            "range": "± 12.56 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20 p50=1056.19ns p75=1068.75ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1d20+5",
            "value": 1660.43,
            "range": "± 6.55 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1d20+5 p50=1660.43ns p75=1666.98ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 3d6",
            "value": 1149,
            "range": "± 13.34 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=3d6 p50=1149ns p75=1162.34ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d6+3",
            "value": 1676.82,
            "range": "± 7.82 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d6+3 p50=1676.82ns p75=1684.64ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4dF",
            "value": 1068.78,
            "range": "± 23.61 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4dF p50=1068.78ns p75=1092.39ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 4d6kh3",
            "value": 2737.23,
            "range": "± 24.34 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=4d6kh3 p50=2737.23ns p75=2761.56ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / {1d6+2}kh1",
            "value": 2935.83,
            "range": "± 23.13 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case={1d6+2}kh1 p50=2935.83ns p75=2958.96ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 2d20kh1 vs 15",
            "value": 3110.1,
            "range": "± 68.94 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=2d20kh1 vs 15 p50=3110.1ns p75=3179.04ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 10d10>=6f1",
            "value": 4068.03,
            "range": "± 70.69 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=10d10>=6f1 p50=4068.03ns p75=4138.72ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / floor((1d4+1)*2/3)",
            "value": 3774.05,
            "range": "± 52.12 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=floor((1d4+1)*2/3) p50=3774.05ns p75=3826.18ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / @atk+1d20",
            "value": 1860.3,
            "range": "± 13.27 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=@atk+1d20 p50=1860.3ns p75=1873.57ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / sum-20-terms",
            "value": 10145.98,
            "range": "± 62.9 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=sum-20-terms p50=10145.98ns p75=10208.88ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6",
            "value": 7734.7,
            "range": "± 126.18 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6 p50=7734.7ns p75=7860.88ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 100d6kh1",
            "value": 21283.9,
            "range": "± 267.77 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=100d6kh1 p50=21283.9ns p75=21551.67ns mode=batch"
          },
          {
            "name": "roll (injected RNG) / 1000d6",
            "value": 62095.53,
            "range": "± 492.49 ns",
            "unit": "ns",
            "extra": "group=roll (injected RNG) case=1000d6 p50=62095.53ns p75=62588.02ns mode=batch"
          }
        ]
      }
    ]
  }
}