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
            return player[this.layer].points.log10().pow(0.5).log10(2).plus(1);
        }
        },
        32:{ title: "Memory inflation",
        description: "Memory Extraction is much faster.",
        cost: new Decimal(50000),
        unlocked() { return hasUpgrade("mem", 31) },
        },
        33:{ title: "Directly Transfer",
        description: "Memories gain is massively boosted, but with Fragments gain massively decreased.",
        cost: new Decimal(500000),
        unlocked() { return hasUpgrade("mem", 32) },
        },
        34:{ title: "Conclusion",
        description: "Unlock two new layers, but with Memories gain decreased.",
        cost: new Decimal(10000000),
        unlocked() { return hasUpgrade("mem", 33) },
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
    requires(){return new Decimal(1e9).times((player.light.unlockOrder&&!player.light.unlocked)?5000:1)}, // Can be a function that takes requirement increases into account
    resource: "Light Tachyons", // Name of prestige currency
    baseResource: "Memories", // Name of resource prestige is based on
    baseAmount() {return player.mem.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    hotkeys: [
        {key: "l", description: "L: Reset for Light Tachyons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('mem', 34)||player.light.unlocked},
    increaseUnlockOrder: ["dark"],

    effectBase(){
        let base = new Decimal(1.5);
        return base;
    },
    effect(){
        return Decimal.times(tmp.light.effectBase,player.light.points.plus(1))
    },
    effectDescription() {
        return "which are boosting Fragments generation by "+format(tmp.light.effect)+"x"
    },

    upgrades:{
        11:{ title: "Optimistic Thoughts",
        description: "Conclusion decreases Memories gain less.",
        cost: new Decimal(1),
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
    requires(){return new Decimal(29997).times((player.dark.unlockOrder&&!player.dark.unlocked)?99:1)}, // Can be a function that takes requirement increases into account
    resource: "Dark Matters", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    hotkeys: [
        {key: "d", description: "D: Reset for Dark Matters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('mem', 34)||player.dark.unlocked},
    increaseUnlockOrder: ["light"],

    upgrades:{
        
    }
})