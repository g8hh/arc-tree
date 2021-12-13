addLayer("mem", {
    name: "Memories", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#c939db",
    requires: new Decimal(15), // Can be a function that takes requirement increases into account
    resource: "Memories", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('mem', 12)) mult = mult.times(upgradeEffect('mem', 12))
        if (hasUpgrade('mem', 24)) mult = mult.times(upgradeEffect('mem', 24))
        if (hasUpgrade('mem', 33)) mult = mult.pow(1.5)
        if (hasUpgrade('mem', 34)) mult = mult.times(!hasUpgrade('light', 11)?0.85:0.9)
        if (player.dark.unlocked) mult = mult.times(tmp.dark.effect);
        if (hasUpgrade('light', 12)) mult=mult.times(tmp.light.effect.div(2).gt(1)?tmp.light.effect.div(2):1);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade('mem', 13)) exp = exp.times(upgradeEffect('mem', 13))
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for Memories", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    doReset(resettingLayer){
        let keep=[];
        let dark23=[34];
        if (layers[resettingLayer].row > this.row) layerDataReset("mem", keep);
        if (hasUpgrade('dark', 23)&&(resettingLayer=="light"||resettingLayer=="dark")) player[this.layer].upgrades=dark23;
        if (hasAchievement("a", 13)&&player[this.layer].points.eq(0)) player[this.layer].points=new Decimal(5);
    },

    upgrades:{
        11:{ title: "Thought Collect",
        description: "Speed up collecting your Fragments.",
        cost: new Decimal(1),
        effect() {
            let eff=new Decimal(1.5);
            if (hasUpgrade('mem', 21)) eff=eff.pow(upgradeEffect('mem', 21));
            return eff;
        }
        },
        12:{ title: "Memory Extraction",
        description: "Memories gain is boosted by Memories.",
        cost: new Decimal(3),
        unlocked() { return hasUpgrade("mem", 11) },
        effect() {
            let eff=player[this.layer].points.add(1).pow(0.25);
            if (hasUpgrade('mem', 32)) eff=eff.pow(1.25);
            return eff;
        }
        },
        13:{ title: "Algorithm Managing",
        description: "Lower Fragments requirement for further Memories",
        cost: new Decimal(10),
        unlocked() { return hasUpgrade("mem", 12) },
        effect() {
            let eff=new Decimal(1.25);
            if (hasUpgrade('mem', 23)) eff=eff.pow(upgradeEffect('mem', 23));
            return eff;
        },
        },
        14:{ title: "Fragments Duplication",
        description: "Fragments gain is boosted by Fragments",
        cost: new Decimal(20),
        unlocked() { return hasUpgrade("mem", 13) },
        effect() {
            return player.points.plus(1).log10().pow(0.75).plus(1)
        }
        },
        21:{ title: "Thought Combination",
        description: "Thought Collect is much faster",
        cost: new Decimal(30),
        unlocked() { return hasUpgrade("mem", 14) },
        effect() {
            let eff= new Decimal(2);
            if (hasUpgrade('mem', 31)) eff=eff.pow(upgradeEffect('mem', 31));
            return eff
        }
        },
        22:{ title: "Fragments Prediction",
        description: "Fragments gain is boosted by Memories",
        cost: new Decimal(50),
        unlocked() { return hasUpgrade("mem", 21) },
        effect() {
            return player[this.layer].points.add(1).pow(0.5)
        }
        },
        23:{ title: "Time Boosting",
        description: "Algorithm Managing is effected by Fragments.",
        cost: new Decimal(100),
        unlocked() { return hasUpgrade("mem", 22) },
        effect() {
            return player.points.plus(1).times(1.5).log10().log10(2).pow(0.01).plus(1)
        }
        },
        24:{ title: "Directly Drown",
        description: "Memories gain is boosted by Fragments.",
        cost: new Decimal(1000),
        unlocked() { return hasUpgrade("mem", 23) },
        effect() {
            return player.points.pow(0.05).plus(1).log10().plus(2).log10(5).plus(1);
        }
        },
        31:{ title: "Thought Growth",
        description: "Thought Combination is boosted by Memories",
        cost: new Decimal(20000),
        unlocked() { return hasUpgrade("mem", 24) },
        effect() {
            return player[this.layer].points.plus(1).log10().pow(0.5).log10(2);
        }
        },
        32:{ title: "Memory Inflation",
        description: "Memory Extraction is much faster.",
        cost: new Decimal(50000),
        unlocked() { return hasUpgrade("mem", 31) },
        },
        33:{ title: "Directly Transfer",
        description: "Memories gain is massively boosted, but with Fragments gain massively decreased and Fragments&Memories set to 1.",
        cost: new Decimal(500000),
        unlocked() { return hasUpgrade("mem", 32) },
        onPurchase(){player.points=new Decimal(1);player[this.layer].points = new Decimal(1);},
        },
        34:{ title: "Conclusion",
        description: "Unlock two new layers, but with Memories gain decreased and Fragments&Memories set to 1.",
        cost: new Decimal(10000000),
        unlocked() { return (hasUpgrade("mem", 33)||hasUpgrade("dark",23))},
        onPurchase(){player.points=new Decimal(1);player[this.layer].points = new Decimal(1);},
        },
    }
})

addLayer("light", {
    name: "Light Tachyon", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        unlockOrder:0,
    }},
    color: "#ededed",
    requires(){return new Decimal(2e8).times((player.light.unlockOrder&&!player.light.unlocked)?500:1)}, // Can be a function that takes requirement increases into account
    resource: "Light Tachyons", // Name of prestige currency
    baseResource: "Memories", // Name of resource prestige is based on
    baseAmount() {return player.mem.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade("light", 13)) mult=mult.times(tmp.light.effect.pow(0.15))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (player[this.layer].points.gte(5)) exp = new Decimal(1.5);
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    hotkeys: [
        {key: "l", description: "L: Reset for Light Tachyons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('mem', 34)},
    increaseUnlockOrder: ["dark"],

    doReset(resettingLayer){
        let keep=[];
        if (layers[resettingLayer].row > this.row) layerDataReset('light', keep);
        if (player.tab=='light'&&!hasUpgrade('dark', 23)) showTab('none');
    },

    effectBase(){
        let base = new Decimal(1.5);
        return base;
    },
    effect(){
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff=Decimal.times(tmp.light.effectBase,player.light.points.plus(1));
        if (eff.lt(1)) return 1;
        return eff;
    },
    effectDescription() {
        return "which are boosting Fragments generation by "+format(tmp.light.effect)+"x"
    },

    upgrades:{
        11:{ title: "Optimistic Thoughts",
        description: "Conclusion decreases Memories gain less.",
        unlocked() { return player.light.unlocked },
        cost: new Decimal(1),
        },
        12:{ title: "Wandering For Beauty",
        description: "Light Tachyons also effects Memories gain at a reduced rate.",
        unlocked() { return hasUpgrade("light", 11) },
        cost: new Decimal(3),
        },
        13:{ title: "Experiencing Happiness",
        description: "Light Tachyons also effects its own gain at a reduced rate.",
        unlocked() { return hasUpgrade("light", 12) },
        cost: new Decimal(5),
        },
    }
})

addLayer("dark", {
    name: "Dark Matters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        unlockOrder:0,
    }},
    color: "#383838",
    requires(){return new Decimal(9999).times((player.dark.unlockOrder&&!player.dark.unlocked)?9:1)}, // Can be a function that takes requirement increases into account
    resource: "Dark Matters", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("dark", 13)) mult=mult.times(tmp.dark.effect.pow(0.75))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);
        if (player[this.layer].points.gte(5)) exp = new Decimal(1.5);
        return exp;
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    hotkeys: [
        {key: "d", description: "D: Reset for Dark Matters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('mem', 34)},
    increaseUnlockOrder: ["light"],

    doReset(resettingLayer){
        let keep=[];
        if (layers[resettingLayer].row > this.row) layerDataReset('dark', keep);
        if (player.tab=='dark'&&!hasUpgrade('dark', 23)) showTab('none');
    },

    effectBase(){
        let base = new Decimal(1.5);
        return base;
    },
    effect(){
        let eff=Decimal.pow(player[this.layer].points.plus(1).log10().plus(1),tmp.dark.effectBase);
        if (eff.lt(1)) return new Decimal(1);
        return eff;
    },
    effectDescription() {
        return "which are boosting Memories gain by "+format(tmp.dark.effect)+"x"
    },
    upgrades:{
        11:{ title: "Overclock",
        description: "Your Fragments generation is doubled when under 9999",
        unlocked() { return player.dark.unlocked },
        cost: new Decimal(1),
        },
        12:{ title: "Seeking For Other Sides",
        description: "Dark Matters also effects Fragments generation at a reduced rate.",     
        unlocked() { return hasUpgrade("dark", 11) },
        cost: new Decimal(3),
        },
        13:{ title: "Crack Everything",
        description: "Dark Matters also effects its own gain at a reduced rate.",
        unlocked() { return hasUpgrade("dark", 12) },
        cost: new Decimal(5),
        },
        23:{ title: "Force Operation",
        description: "You can keep Conclusion upgrade when L or D reset.",
        cost: new Decimal(100),
        },
    }
})

addLayer("a", {
    startData() { return {
        unlocked: true,
    }},
    color: "yellow",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievements: {
        11: {
            name: "An Essence of the Broken World",
            done() { return player.mem.points.gte(100) },
            tooltip: "Gain 100 Memories.<br>Rewards:Fragments generation is a little faster.",
        },
        12: {
            name: "A Stack",
            done() { return player.points.gte(9999) },
            tooltip: "Gain 9999 Fragments.",
        },
        13: {
            name: "Two Stacks For Sure",
            done() { return player.points.gte(19998)&&hasUpgrade("mem",33)},
            tooltip: "Gain 19998 Fragments With Directly Transfer.Rewards:You start at 5 Memories when reset.",
        },
    },
    tabFormat: [
        "blank", 
        ["display-text", function() { return "Achievements: "+player.a.achievements.length+"/"+(Object.keys(tmp.a.achievements).length-2) }], 
        "blank", "blank",
        "achievements",
    ],
}, 
)