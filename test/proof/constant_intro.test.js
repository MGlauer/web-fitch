import {Assumption, DisjunctionIntro, AllIntro, ConjunctionIntro, Reiteration} from "../../src/fitch/rules.js"
import {invalidProofTest} from "./base.js"


const test_proof = [
    [
        ["P(a)", Assumption, []]
    ],
    [
        [
            ["", Assumption, [], "a"],
            ["P(a)", Reiteration, [0]]
        ],
        ["!xP(x)", AllIntro, [[1,2]]]
    ]
]

invalidProofTest(test_proof)