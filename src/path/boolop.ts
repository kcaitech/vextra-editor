/*********************************************************************************************\

 Boolean-Operations-Plugin for JavaScript Vector Library Raphaël 2.1 (http://raphaeljs.com/)
 Copyright © 2013 Thomas Richter (https://github.com/poilu/raphael-boolean)
 Licensed under the MIT license (http://opensource.org/licenses/MIT)

\*********************************************************************************************/

import { findDotsAtSegment, isBBoxIntersect, isPointInsideBBox, pathBBox, pathIntersection } from "./intersect";

/*********************************************************************************************\

 Version: 0.3 (released 2021-03-13)
 
      Contributions:
      Bruno Heridet (https://github.com/Delapouite)
    Sam Hocelet (https://github.com/samhocevar)

    TODO:
    Currently the plugin is not able to handle self intersecting (sub-)paths properly.
    This is concerning fills in SVG due to default non-zero fill rule.
    Such sub-paths should be splitted into closed and not self intersecting sub-paths
    while removing not filled ones before performing the boolean operation.

\*********************************************************************************************/


/**
 * convert a path array into path string
 *
 * @param arr pathArr
 *
 * @returns string
 */
export function pathArrToStr(pathArr: (string | number)[][]): string {
    return pathArr.join(",").replace(/,?([achlmqrstvxz]),?/gi, "$1");
}

/**
 * Shortcut helper
 *
 * @returns string (path string)
 */
export function pathSegsToStr(pathSegs: (string|number)[][]): string {
    return pathArrToStr(pathSegsToArr(pathSegs));
}

/**
 * convert raphael's internal path representation (must be converted to curves before) to segments / bezier curves
 *
 * @param array pathArr (RaphaelJS path array)
 *
 * @returns array pathSegs (path as a collection of segments)
 */
function pathArrToSegs(pathArr: (string | number)[][]): (number)[][] {
    const pathSegs:(number)[][] = [];

    for (let i = 0; i < pathArr.length; i++) {
        //if command is a moveto create new sub-path
        const seg: number[] = [];
        if (pathArr[i][0] != "M") {

            seg.push(<number>pathArr[i - 1][pathArr[i - 1].length - 2],<number> pathArr[i - 1][pathArr[i - 1].length - 1]);

            for (let j = 1; j < pathArr[i].length; j++) {
                seg.push(<number>pathArr[i][j]);
            }
        }
        //add empty segments for "moveto", because Raphael counts it when calculating interceptions
        if (i > 0) {
            pathSegs.push(seg);
        }

    }

    return pathSegs;
}

/**
 * convert segments / bezier curves representation of a path to raphael's internal path representation (svg commands as array)
 *
 * @param array pathSegs (path as a collection of segments)
 *
 * @returns array pathArr (RaphaelJS path array)
 */
function pathSegsToArr(pathSegs: (string|number)[][]): (string | number)[][] {
    const pathArr = [];

    for (let i = 0; i < pathSegs.length; i++) {
        //ignore empty segments
        if (pathSegs[i].length === 0) {
            continue;
        }
        let command = [];
        //if start point of current segment is different from end point of previous segment add a new subpath
        if (i === 0 || (pathSegs[i][0] != pathSegs[i - 1][pathSegs[i - 1].length - 2] || pathSegs[i][1] != pathSegs[i - 1][pathSegs[i - 1].length - 1])) {
            command.push("M", pathSegs[i][0], pathSegs[i][1]);
            pathArr.push(command);
            command = [];
        }
        command.push("C");

        for (let j = 2; j < pathSegs[i].length; j++) {
            command.push(pathSegs[i][j]);
        }
        pathArr.push(command);
    }

    return pathArr;
}

/**
 * mark the starting and ending points of all subpaths
 * to simplify later building of closed paths
 *
 * @params (a list of paths in segment representation)
 *
 * @returns void
 */
function markSubpathEndings(...args: (number)[][][]) {
    let currentId, //id of the current path's starting point
        markedCount = 0;
    const markedPoints:any = {};
    let path: any|undefined;

    //generate a unique id for unknown points
    function findOrCreateId(x: number, y: number) {
        const id = markedPoints[[x, y].toString()];
        if (id) {
            return id;
        }
        return markedPoints[[x, y].toString()] = "S" + markedCount++;
    }

    //iterate paths
    for (let i = 0; i < args.length; i++) {
        path = args[i];
        //iterate path segments
        for (let j = 0; j < path.length; j++) {
            //first segment of a path has always starting point of subpath
            if (j === 0) {
                currentId = findOrCreateId(path[j][0], path[j][1]);
                path[j].startPoint = currentId;
            }

            //if ending point of a segment is different from starting  point of next seg. mark both
            if (j < path.length - 1) {
                if (path[j][6] != path[j + 1][0] || path[j][7] != path[j + 1][1]) {
                    path[j].endPoint = currentId;
                    currentId = findOrCreateId(path[j + 1][0], path[j + 1][1]);
                    path[j + 1].startPoint = currentId;
                }
            }

            //if all coords of a segment are the same mark starting and ending point (RaphaelJS bug)

            //last segment of a path has always ending point of subpath
            if (j == path.length - 1) {
                path[j].endPoint = currentId;
            }
        }
    }
}

/**
 * splits a segment of given path into two by using de Casteljau's algorithm (http://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm - Geometric interpretation)
 *
 * @param array pathSegs (segment representation of a path returned by function pathArrToSegs)
 * @param int segNr (nr of the segment - starting with 1, like it is returned by Raphael.pathIntersection: segment1, segment2)
 *
 * @returns void
 */
function splitSegment(pathSegs: any, segNr: number, t: number, newPoint: number[], intersId: number) {
    const oldSeg = pathSegs[segNr];

    //new anchor for start point of segment / bezier curve
    const newA1_1 = [oldSeg[0] + t * (oldSeg[2] - oldSeg[0]), oldSeg[1] + t * (oldSeg[3] - oldSeg[1])];
    //new anchor for end point of segment / bezier curve
    const newA2_2 = [oldSeg[4] + t * (oldSeg[6] - oldSeg[4]), oldSeg[5] + t * (oldSeg[7] - oldSeg[5])];

    //intermediate point between the two original anchors
    const iP = [oldSeg[2] + t * (oldSeg[4] - oldSeg[2]), oldSeg[3] + t * (oldSeg[5] - oldSeg[3])];

    //calculate anchors for the inserted point
    const newA1_2 = [newA1_1[0] + t * (iP[0] - newA1_1[0]), newA1_1[1] + t * (iP[1] - newA1_1[1])];
    const newA2_1 = [iP[0] + t * (newA2_2[0] - iP[0]), iP[1] + t * (newA2_2[1] - iP[1])];

    //set coordinates for new segments
    const newSeg1: any = [oldSeg[0], oldSeg[1], newA1_1[0], newA1_1[1], newA1_2[0], newA1_2[1], newPoint[0], newPoint[1]];
    if (typeof oldSeg.startPoint != "undefined") {
        newSeg1.startPoint = oldSeg.startPoint;
    }
    newSeg1.endPoint = "I" + intersId; //mark end point as intersection

    const newSeg2: any = [newPoint[0], newPoint[1], newA2_1[0], newA2_1[1], newA2_2[0], newA2_2[1], oldSeg[6], oldSeg[7]];
    newSeg2.startPoint = "I" + intersId; //mark start point as intersection
    if (typeof oldSeg.endPoint != "undefined") {
        newSeg2.endPoint = oldSeg.endPoint;
    }

    //insert new segments and replace the old one
    pathSegs.splice(segNr, 1, newSeg1, newSeg2);
}

/**
 * add points path given by intersections array
 *
 * @param array pathSegs (path in segement representation)
 * @param array inters (intersections returned by Raphael.pathIntersection)
 *
 * @returns void
 */
function insertIntersectionPoints(pathSegs: any, pathNr: number, inters: any) {
    for (let i = 0; i < inters.length; i++) {
        let splits = 0;
        let t = <number>inters[i]["t" + pathNr];
        let t1 = 0;
        let t2 = 1;

        for (let j = 0; j <= i; j++) {
            //check if previous segments where splitted before (influences segment nr)
            if (inters[j]["segment" + pathNr] < inters[i]["segment" + pathNr]) {
                splits++;
            }

            //check if currently affected segment was splitted before
            //this influences segment nr and t -> get nearest t1 (lower) and t2 (higher) for recalculation of t
            if (inters[j]["segment" + pathNr] == inters[i]["segment" + pathNr]) {
                if (inters[j]["t" + pathNr] < t) {
                    splits++;
                    if (inters[j]["t" + pathNr] > t1) {
                        t1 = <number>inters[j]["t" + pathNr];
                    }
                }

                if (inters[j]["t" + pathNr] > t && inters[j]["t" + pathNr] < t2) {
                    t2 = <number>inters[j]["t" + pathNr];
                }
            }

        }

        //recalculate t
        t = (t - t1) / (t2 - t1);

        //split intersected segments
        splitSegment(pathSegs, <number>inters[i]["segment" + pathNr] + splits, t, [<number>inters[i].x, <number>inters[i].y], i);
    }
}

/**
 * checks wether a segment is inside a path by selecting the point at t = 0.5 (only works properly after inserting intersections)
 *
 * @param array seg (segment of a path)
 * @param string path (string representation of the [other] path)
 *
 * @returns bool
 */
function isSegInsidePath(seg: any, path: (number)[][]) {
    //get point on segment (t = 0.5)
    const point = findDotsAtSegment(seg[0], seg[1], seg[2], seg[3], seg[4], seg[5], seg[6], seg[7], 0.5);

    //is point inside of given path
    const bbox = pathBBox(path);
    const dx = bbox.width * 1.1;
    const dy = bbox.height * Math.random() / 100;
    return isPointInsideBBox(bbox, point.x, point.y) &&
        (<number>pathIntersection(path, [[point.x, point.y,point.x, point.y,point.x+dx, point.y+dy,point.x+dx, point.y+dy]], true) % 2) == 1;
}

/**
 * invert the coordinates of given segment array
 *
 * @param array segCoords (representing the coords of a segment, length = 7)
 *
 * @returns void
 */
function invertSeg(segCoords: number[]) {
    const tmp = JSON.parse(JSON.stringify(segCoords));
    segCoords[0] = tmp[6];
    segCoords[1] = tmp[7];
    segCoords[2] = tmp[4];
    segCoords[3] = tmp[5];
    segCoords[4] = tmp[2];
    segCoords[5] = tmp[3];
    segCoords[6] = tmp[0];
    segCoords[7] = tmp[1];
}

/**
 * invert the given part (of a path), including coordinates in segments, starting and ending points
 *
 * @param array part
 *
 * returns void
 */
function invertPart(part: any) {
    for (let q = 0; q < part.length; q++) {
        invertSeg(part[q]);
    }
    //invert order of segments
    part.reverse();

    //switch starting and ending points
    const oldStartPoint = part[part.length - 1].startPoint;
    part[0].startPoint = part[0].endPoint;
    if (part.length > 1) {
        delete part[0].endPoint;
    }

    part[part.length - 1].endPoint = oldStartPoint;
    if (part.length > 1) {
        delete part[part.length - 1].startPoint;
    }
}

/**
 * calculate the direction of the given path
 *
 * @param array pathSegArr (path array in segment representation)
 *
 * @returns int dir (1: clockwise, -1: counter clockwise)
 */
function getPathDirection(pathSegArr: (number)[][]) {
    // 这是个evenodd方案？
    let dir = -1;
    let minT, maxT;

    //get y of path's starting point
    const startY = pathSegArr[0][1];

    //convert path to string
    // let path = pathSegsToStr(pathSegArr);
    const box = pathBBox(pathSegArr);

    //"draw" a horizontal line from left to right at half height of path's bbox,
    //with some jitter to avoid intersecting at exact vertices.
    const lineY = box.y + box.height / 2;
    // 从左到右一根直线
    const line = [[box.x ,  (lineY - box.height * Math.random() / 100),box.x ,  (lineY - box.height * Math.random() / 100),
        box.x2 ,  (lineY + box.height * Math.random() / 100), box.x2 ,  (lineY + box.height * Math.random() / 100)]];

    //get intersections of line and path
    const inters = <any[]>pathIntersection(line, pathSegArr);

    //get intersections with extrema for t on line
    for (let i = 0; i < inters.length; i++) {
        if (minT === undefined || inters[i].t1 <= inters[minT].t1) {
            minT = i;
        }
        if (maxT === undefined || inters[i].t1 >= inters[maxT].t1) {
            maxT = i;
        }
    }

    //decide, if path is clockwise (1) or counter clockwise (-1)
    if ((startY < lineY) == (inters[<number>minT].segment2 >= inters[<number>maxT].segment2)) {
        //for path with only one segment compare t
        if (inters[<number>minT].segment2 != inters[<number>maxT].segment2) {
            dir = 1;
        } else if ((startY < lineY) == (inters[<number>minT].t2 >= inters[<number>maxT].t2)) {
            dir = 1;
        }
    }

    return dir;
}

/**
 * wrapper for RaphaelJS pathIntersection()
 * with filter for redundant intersections caused by self-intersection (path1 = path2)
 *
 * @param string path1
 * @param string path2
 *
 * @returns array validInters (filtered path intersections calculated by Raphael.pathIntersections())
 */
function getIntersections(path1: (number)[][], path2: (number)[][]) {
    const box1 = pathBBox(path1);
    const box2 = pathBBox(path2);
    if (!isBBoxIntersect(box1, box2)) {
        return [];
    }

    //min. deviation to assume point as different from another
    const d = Math.max(box1.width, box1.height, box2.width, box2.height) / 1000;
    const inters = <any[]>pathIntersection(path1, path2);
    const validInters = [];
    let valid = true;

    //iterate all other intersections
    for (let i = 0; i < inters.length; i++) {
        const p = inters[i];
        valid = true;

        //iterate all valid intersections and check if point already exists, if not push to valid intersections
        for (let j = 0; j < validInters.length; j++) {
            if ((Math.abs(validInters[j].x - p.x) < d && Math.abs(validInters[j].y - p.y) < d)) {
                valid = false;
                break;
            }
        }

        if (valid) {
            validInters.push(inters[i]);
        }
    }

    return validInters;
}

/**
 * collect the parts of the resulting path according to given rules for the type of boolean operation
 * a part is characterized as a bunch of segments - first and last segment hosts a sub-path starting / ending point or intersection point
 *
 * @param string type (type of boolean operation)
 * @param array path1Segs (path1 in segment representation)
 * @param array path1Segs (path2 in segment representation)
 *
 * @returns array newParts (array of arrays holding segments)
 */
function buildNewPathParts(type:string, path1Segs:(number)[][], path2Segs:(number)[][]) {
    let IOSituationChecked = false;
    let insideOtherPath; //temporary flag
    let partNeeded = false;
    let segCoords; //temporary array of coordinates of current segment
    let newPathPart: any|any[] = [];
    const newParts = [];

    /*
    Add-Part-to-new-Path-Rules:
        union:
        path1 - segment NOT inside path2
        path2 - segment NOT inside path1
        difference:
        path1 - segment NOT inside path2
        path2 - segment inside path1
        intersection:
        path1 - segment inside path2
        path2 - segment inside path1
    */
    const rules:any = {
        union: {
            0: false,
            1: false
        },
        difference: {
            0: false,
            1: true
        },
        intersection: {
            0: true,
            1: true
        }
    };

    const paths: any = {
        0: {
            segs: path1Segs,
            nr: 1
        },
        1: {
            segs: path2Segs,
            nr: 2
        }
    };

    //iterate both paths and collect parts that are needed according to rules
    for (let p = 0; p <= 1; p++) {
        for (let s = 0; s < paths[p].segs.length; s++) {
            segCoords = paths[p].segs[s];

            if (segCoords.length === 0) {
                continue;
            }
            if (!IOSituationChecked) {
                insideOtherPath = isSegInsidePath(segCoords, (paths[p ^ 1].segs));
                IOSituationChecked = true;
                partNeeded = (rules[type][p] == insideOtherPath);
            }

            //if conditions are satisfied add current segment to new part
            if (partNeeded) {
                newPathPart.push(segCoords);
            }

            if (typeof segCoords.endPoint != "undefined") {
                if (partNeeded) {
                    newPathPart.pathNr = paths[p].nr;
                    newParts.push(newPathPart);
                }
                newPathPart = [];
                IOSituationChecked = false;
            }
        }
    }

    return newParts;
}

/**
 * build indexes of the given path parts in order to simplify the process of putting parts together to a new path
 *
 * @param array parts
 *
 * @returns object (holding indexes and information about inverted parts)
 */
function buildPartIndexes(parts:any[]) {
    const startIndex: any = {};
    const endIndex: any = {};
    const inversions: any = {
        1: 0,
        2: 0
    }; //count inversions on parts formerly belonging to path with the particular number

    //iterate all parts of the new path and build indices of starting and ending points
    for (let p = 0; p < parts.length; p++) {

        //if starting point or ending point id already exists (and there are different) invert the part
        if (parts[p][0].startPoint != parts[p][parts[p].length - 1].endPoint) { //parts[p].pathNr == 2 &&
            if (typeof startIndex[parts[p][0].startPoint] != "undefined" || typeof endIndex[parts[p][parts[p].length - 1].endPoint] != "undefined") {
                //invert the segments
                invertPart(parts[p]);

                //count inversions
                inversions[parts[p].pathNr]++;
                parts[p].inverted = true;
            }
        }

        //save intersection id at starting point
        startIndex[parts[p][0].startPoint] = p;
        endIndex[parts[p][parts[p].length - 1].endPoint] = p;
    }

    return {
        inversions: inversions,
        startIndex: startIndex,
        endIndex: endIndex
    };
}

/**
 * the final step: build a new path out of the given parts by putting together the appropriate starting end ending points
 *
 * @param string type (type of the boolean operation)
 * @param array parts (see buildNewPathParts())
 * @param object inversions (see buildPartIndexes())
 * @param array startIndex (see buildPartIndexes())
 *
 * @returns array resultPath (segment representation of the operation's resulting path)
 */
function buildNewPath(type: string, parts:any[], inversions:any[], startIndex: any) {
    const newPath:(number)[][][] = [];

    //for union operation correct path directions where necessary
    if (type == "union") {
        //if inversions occured invert also other parts of the path (only where starting point = ending point)
        for (let p = 0; p < parts.length; p++) {
            if (inversions[parts[p].pathNr] > 0 && !parts[p].inverted && parts[p][0].startPoint == parts[p][parts[p].length - 1].endPoint) {
                invertPart(parts[p]);
            }
        }
    }

    let dirCheck:number[] | undefined;
    //build new path as an array of (closed) sub-paths (segment representation)
    if (parts.length > 0) {
        let partsAdded = 0;
        let curPart = parts[0];
        let firstStartPoint = parts[0][0].startPoint;
        let endPointId;
        let subPath:number[][] = [];
        dirCheck = []; //starting position of subpaths marked for a direction check

        while (partsAdded < parts.length && curPart) {
            //for difference operation prepare correction of path directions where necessary
            if (type == "difference") {
                //if part was belonging to path 2 and starting point = ending point (means part was a subpath of path2 and completely inside path1)
                if (curPart.pathNr == 2 && curPart[0].startPoint == curPart[curPart.length - 1].endPoint) {
                    dirCheck.push(newPath.length);
                }
            }

            subPath = subPath.concat(curPart);
            partsAdded++;
            endPointId = curPart[curPart.length - 1].endPoint;
            curPart.added = true;
            if (endPointId != firstStartPoint) { //path isn't closed yet
                curPart = parts[startIndex[endPointId]]; //new part to add is the one that has current ending point as starting point
            } else { //add subpath to new path and find part that hasn't been added yet to start a new sub-path
                newPath.push(subPath);
                subPath = [];

                for (let p = 1; p < parts.length; p++) {
                    if (!parts[p].added) {
                        curPart = parts[p];
                        firstStartPoint = parts[p][0].startPoint;
                        break;
                    }
                }
            }
        }
    }

    //for difference operation correct path direction (by inverting sub-paths) where necessary
    if (type == "difference") {
        const dcLen = dirCheck && dirCheck.length || 0;
        for (let i = 0; i < dcLen; i++) {
            //inside which subpath is the subpath that has to be checked
            for (let o = 0; o < newPath.length; o++) {
                if ((<number[]>dirCheck)[i] == o) {
                    continue;
                }
                if (isSegInsidePath(newPath[(<number[]>dirCheck)[i]][0], (newPath[o]))) {
                    const pathDirOut = getPathDirection(newPath[o]);
                    const pathDirIn = getPathDirection(newPath[(<number[]>dirCheck)[i]]);

                    //if both subpaths have the same direction invert the inner path
                    if (pathDirIn == pathDirOut) {
                        invertPart(newPath[(<number[]>dirCheck)[i]]);
                    }
                }
            }
        }
    }

    //flatten new path
    let resultPath:(number)[][] = [];
    for (let i = 0; i < newPath.length; i++) {
        resultPath = resultPath.concat(newPath[i]);
    }

    return resultPath;
}

/**
 * execute the bool operation
 *
 * @param string type (name of the boolean operation)
 * @param array path1Segs (segment representation of path1)
 * @param array path2Segs (segment representation of path2)
 *
 * @return array newPath (segment representation of the resulting path)
 */
function execBO(type: string, path1Segs:(number)[][], path2Segs:(number)[][]) {
    // path1Segs = JSON.parse(JSON.stringify(path1Segs)); // deep clone
    // path2Segs = JSON.parse(JSON.stringify(path2Segs));

    //mark the starting and ending points of the subpaths
    markSubpathEndings(path1Segs, path2Segs);

    //get intersections of both paths
    const inters = getIntersections((path1Segs), (path2Segs));

    //if any insert intersections into paths
    if (inters.length > 0) {
        insertIntersectionPoints(path1Segs, 1, inters);
        insertIntersectionPoints(path2Segs, 2, inters);
    }

    const newParts = buildNewPathParts(type, path1Segs, path2Segs);

    const indexes = buildPartIndexes(newParts);

    return pathSegsToArr(buildNewPath(type, newParts, indexes.inversions, indexes.startIndex));
}

/**
 * prepare a RaphaelJS element for boolean operation
 *
 * @param object el (RaphaelJS element)
 *
 * @returns array pathSegs (given element in path segment representation)
 */
function prepare(pathArr: (string | number)[][]):(number)[][] {
    return pathArrToSegs(pathArr);
}

/**
 * perform a union of the two given paths
 *
 * @param object el1 (RaphaelJS element)
 * @param object el2 (RaphaelJS element)
 *
 * @returns string (path string)
 */
export function union(el1: (string | number)[][], el2: (string | number)[][]):(string | number)[][] {
    const pathA = prepare(el1),
        pathB = prepare(el2);
    return (execBO("union", pathA, pathB));
}

/**
 * perform a difference of the two given paths
 *
 * @param object el1 (RaphaelJS element)
 * @param object el2 (RaphaelJS element)
 *
 * @returns string (path string)
 */
export function difference(el1: (string | number)[][], el2: (string | number)[][]):(string | number)[][] {
    const pathA = prepare(el1),
        pathB = prepare(el2);
    return (execBO("difference", pathA, pathB));
}

/**
 * perform an intersection of the two given paths
 *
 * @param object el1 (RaphaelJS element)
 * @param object el2 (RaphaelJS element)
 *
 * @returns string (path string)
 */
export function intersection(el1: (string | number)[][], el2: (string | number)[][]):(string | number)[][] {
    const pathA = prepare(el1),
        pathB = prepare(el2);
    return (execBO("intersection", pathA, pathB));
}

/**
 * perform an exclusion of the two given paths -> A Exclusion B = (A Union B) Difference (A Intersection B)
 *
 * @param object el1 (RaphaelJS element)
 * @param object el2 (RaphaelJS element)
 *
 * @returns string (path string)
 */
export function exclusion(el1: (string | number)[][], el2: (string | number)[][]):(string | number)[][] {
    const pathA = prepare(el1),
        pathB = prepare(el2);
    return (execBO("difference", 
        JSON.parse(JSON.stringify(pathA)), 
        JSON.parse(JSON.stringify(pathB))))
        .concat(execBO("difference", pathB, pathA));
}

