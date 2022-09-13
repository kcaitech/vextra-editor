# Details

Date : 2022-07-16 16:57:24

Directory c:\\Users\\QIANG\\dev\\sktest\\src\\pathops

Total : 43 files,  7553 codes, 1370 comments, 1214 blanks, all 10137 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [src/pathops/README.md](/src/pathops/README.md) | Markdown | 1 | 0 | 1 | 2 |
| [src/pathops/sk-add-intersections.ts](/src/pathops/sk-add-intersections.ts) | TypeScript | 272 | 64 | 1 | 337 |
| [src/pathops/sk-intersection-helper.ts](/src/pathops/sk-intersection-helper.ts) | TypeScript | 80 | 2 | 24 | 106 |
| [src/pathops/sk-intersections.ts](/src/pathops/sk-intersections.ts) | TypeScript | 264 | 67 | 64 | 395 |
| [src/pathops/sk-line-parameters.ts](/src/pathops/sk-line-parameters.ts) | TypeScript | 132 | 10 | 18 | 160 |
| [src/pathops/sk-reduce-order.ts](/src/pathops/sk-reduce-order.ts) | TypeScript | 26 | 0 | 9 | 35 |
| [src/pathops/skd-conic-line-intersection.ts](/src/pathops/skd-conic-line-intersection.ts) | TypeScript | 342 | 3 | 30 | 375 |
| [src/pathops/skd-cubic-line-intersection.ts](/src/pathops/skd-cubic-line-intersection.ts) | TypeScript | 343 | 72 | 30 | 445 |
| [src/pathops/skd-cubic-to-quads.ts](/src/pathops/skd-cubic-to-quads.ts) | TypeScript | 0 | 21 | 3 | 24 |
| [src/pathops/skd-line-intersection.ts](/src/pathops/skd-line-intersection.ts) | TypeScript | 282 | 36 | 10 | 328 |
| [src/pathops/skd-quad-line-intersection.ts](/src/pathops/skd-quad-line-intersection.ts) | TypeScript | 333 | 95 | 33 | 461 |
| [src/pathops/skop-angle.ts](/src/pathops/skop-angle.ts) | TypeScript | 957 | 174 | 33 | 1,164 |
| [src/pathops/skop-builder.ts](/src/pathops/skop-builder.ts) | TypeScript | 171 | 7 | 6 | 184 |
| [src/pathops/skop-coincidence.ts](/src/pathops/skop-coincidence.ts) | TypeScript | 240 | 5 | 41 | 286 |
| [src/pathops/skop-contour.ts](/src/pathops/skop-contour.ts) | TypeScript | 277 | 42 | 72 | 391 |
| [src/pathops/skop-cubic-hull.ts](/src/pathops/skop-cubic-hull.ts) | TypeScript | 119 | 19 | 5 | 143 |
| [src/pathops/skop-edge-builder.ts](/src/pathops/skop-edge-builder.ts) | TypeScript | 46 | 1 | 14 | 61 |
| [src/pathops/skop-segment.ts](/src/pathops/skop-segment.ts) | TypeScript | 428 | 26 | 139 | 593 |
| [src/pathops/skop-span.ts](/src/pathops/skop-span.ts) | TypeScript | 685 | 160 | 100 | 945 |
| [src/pathops/skpath-ops-as-winding.ts](/src/pathops/skpath-ops-as-winding.ts) | TypeScript | 362 | 26 | 21 | 409 |
| [src/pathops/skpath-ops-bounds.ts](/src/pathops/skpath-ops-bounds.ts) | TypeScript | 43 | 4 | 6 | 53 |
| [src/pathops/skpath-ops-common.ts](/src/pathops/skpath-ops-common.ts) | TypeScript | 6 | 0 | 4 | 10 |
| [src/pathops/skpath-ops-conic.ts](/src/pathops/skpath-ops-conic.ts) | TypeScript | 118 | 32 | 54 | 204 |
| [src/pathops/skpath-ops-cubic.ts](/src/pathops/skpath-ops-cubic.ts) | TypeScript | 177 | 89 | 78 | 344 |
| [src/pathops/skpath-ops-curve.ts](/src/pathops/skpath-ops-curve.ts) | TypeScript | 334 | 0 | 69 | 403 |
| [src/pathops/skpath-ops-line.ts](/src/pathops/skpath-ops-line.ts) | TypeScript | 27 | 5 | 14 | 46 |
| [src/pathops/skpath-ops-op.ts](/src/pathops/skpath-ops-op.ts) | TypeScript | 282 | 23 | 22 | 327 |
| [src/pathops/skpath-ops-point.ts](/src/pathops/skpath-ops-point.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [src/pathops/skpath-ops-quad.ts](/src/pathops/skpath-ops-quad.ts) | TypeScript | 134 | 37 | 58 | 229 |
| [src/pathops/skpath-ops-rect.ts](/src/pathops/skpath-ops-rect.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [src/pathops/skpath-ops-simplify.ts](/src/pathops/skpath-ops-simplify.ts) | TypeScript | 158 | 12 | 13 | 183 |
| [src/pathops/skpath-ops-t-curve.ts](/src/pathops/skpath-ops-t-curve.ts) | TypeScript | 26 | 12 | 3 | 41 |
| [src/pathops/skpath-ops-t-sect.ts](/src/pathops/skpath-ops-t-sect.ts) | TypeScript | 232 | 86 | 89 | 407 |
| [src/pathops/skpath-ops-tight-bounds.ts](/src/pathops/skpath-ops-tight-bounds.ts) | TypeScript | 60 | 1 | 1 | 62 |
| [src/pathops/skpath-ops-types.ts](/src/pathops/skpath-ops-types.ts) | TypeScript | 351 | 103 | 94 | 548 |
| [src/pathops/skpath-ops-winding.ts](/src/pathops/skpath-ops-winding.ts) | TypeScript | 17 | 1 | 3 | 21 |
| [src/pathops/skpath-ops.ts](/src/pathops/skpath-ops.ts) | TypeScript | 7 | 3 | 2 | 12 |
| [src/pathops/skpath-ref.ts](/src/pathops/skpath-ref.ts) | TypeScript | 34 | 0 | 7 | 41 |
| [src/pathops/skpath-types.ts](/src/pathops/skpath-types.ts) | TypeScript | 44 | 6 | 8 | 58 |
| [src/pathops/skpath-writer.ts](/src/pathops/skpath-writer.ts) | TypeScript | 31 | 0 | 5 | 36 |
| [src/pathops/skpath.ts](/src/pathops/skpath.ts) | TypeScript | 66 | 126 | 23 | 215 |
| [src/pathops/skpoint.ts](/src/pathops/skpoint.ts) | TypeScript | 34 | 0 | 4 | 38 |
| [src/pathops/skrect.ts](/src/pathops/skrect.ts) | TypeScript | 10 | 0 | 2 | 12 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)