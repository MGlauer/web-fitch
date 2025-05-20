import {Assumption, ConjunctionElim, ConjunctionIntro, FalsumIntro} from "../../src/fitch/rules.js";
import {validProofTest} from "./base.js";

const test_proof = [
    [
        ["", Assumption, []]
    ],
    [
        [
            ["A", Assumption, []],
            [
                ["~A", Assumption, []],
                ["#", FalsumIntro, [1,2]],
            ]
        ],
        [
            ["~A", Assumption, []],
            [
                ["A", Assumption, []],
                ["#", FalsumIntro, [4,5]],
            ]
        ]

    ]
]

validProofTest(test_proof)
