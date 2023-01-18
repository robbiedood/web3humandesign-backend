"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._lifeDefinition = exports._motorCenters = exports._centerIndex = exports._centerChannelDict = exports._channelPairDict = void 0;
const _channelPairDict = {
    1: [8],
    2: [14],
    3: [60],
    4: [63],
    5: [15],
    6: [59],
    7: [31],
    9: [52],
    10: [20, 34, 57],
    11: [56],
    12: [22],
    13: [33],
    16: [48],
    17: [62],
    18: [58],
    19: [49],
    20: [34, 57],
    21: [45],
    23: [43],
    24: [61],
    25: [51],
    26: [44],
    27: [50],
    28: [38],
    29: [46],
    30: [41],
    32: [54],
    34: [57],
    35: [36],
    37: [40],
    39: [55],
    42: [53],
    47: [64],
};
exports._channelPairDict = _channelPairDict;
const _centerChannelDict = {
    root: [19, 38, 39, 41, 52, 53, 54, 58, 60],
    sacral: [3, 5, 9, 14, 27, 29, 34, 42, 59],
    solarPlexus: [6, 22, 30, 36, 37, 49, 55],
    spleen: [18, 28, 32, 44, 48, 50, 57],
    heart: [21, 26, 40, 51],
    g: [1, 2, 7, 10, 13, 15, 25, 46],
    throat: [8, 12, 16, 20, 23, 31, 33, 35, 45, 56, 62],
    ajna: [4, 11, 17, 24, 43, 47],
    head: [61, 63, 64]
};
exports._centerChannelDict = _centerChannelDict;
const _centerIndex = {
    head: 1,
    ajna: 2,
    throat: 3,
    g: 4,
    heart: 5,
    spleen: 6,
    solarPlexus: 7,
    sacral: 8,
    root: 9
};
exports._centerIndex = _centerIndex;
const _motorCenters = ['root', 'sacral', 'heart', 'solarPlexus'];
exports._motorCenters = _motorCenters;
const _lifeDefinition = {
    0: 'Undefined',
    1: 'Single',
    2: 'Double',
    3: 'Triple',
    4: 'Quadruple'
};
exports._lifeDefinition = _lifeDefinition;
