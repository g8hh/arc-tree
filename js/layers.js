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
    softcap() {
        let sc = new Decimal("1e10");
        if (hasUpgrade('dark',21)) sc=sc.times(50);
        if (hasUpgrade('dark',32)) sc=sc.times(upgradeEffect('dark', 32));
        if (hasUpgrade('mem',34)&&hasAchievement('a',23))sc = sc.times((50-Math.sqrt(player.mem.resetTime)<5)?5:50-Math.sqrt(player.mem.resetTime));
        if (hasMilestone('dark',2))sc = sc.times(tmp.dark.effect);
        if (hasAchievement('a',25)) sc = sc.times(player.points.plus(1).log10().plus(1));
        return sc;
    },
    softcapPower() {
        let scp = 0.25;
        if (hasUpgrade('light',21)) scp = 0.33;
        if (hasUpgrade('light',32)) scp = 0.40;
        if (hasMilestone('light',2)) scp = scp + 0.02;
        return scp;
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('mem', 12)) mult = mult.times(upgradeEffect('mem', 12))
        if (hasUpgrade('mem', 24)) mult = mult.times(upgradeEffect('mem', 24))
        if (hasUpgrade('mem', 33)) mult = mult.pow(upgradeEffect('mem', 33))
        if (hasUpgrade('mem', 34)&&!hasAchievement('a',22)) mult = mult.times(!hasUpgrade('light', 11)?0.85:upgradeEffect('light', 11))
        if (player.dark.unlocked) mult = mult.times(tmp.dark.effect);
        if (hasUpgrade('light', 12)) mult=mult.times(tmp.light.effect.div(2).gt(1)?tmp.light.effect.div(2):1);
        return mult
    },
    directMult(){
        let eff=new Decimal(1);
        if (hasAchievement('a',15)) eff=eff.times(1.5);
        if (player.lethe.unlocked) eff=eff.times(tmp.lethe.effect);
        return eff;
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade('mem', 13)) exp = exp.times(upgradeEffect('mem', 13))
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    displayRow: 1,
    hotkeys: [
        {key: "m", description: "M: Reset for Memories", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    passiveGeneration() { 
        let pg = 0;
        if (hasMilestone('light',3)) pg=pg+0.05;
        if (hasMilestone('dark',3)) pg=pg+0.05;
        return pg;
     },
    doReset(resettingLayer){
        let keep=[];
        //let dark23=[34];
        if (layers[resettingLayer].row > this.row) layerDataReset("mem", keep);
        if (hasMilestone('light',1)) player[this.layer].upgrades = player[this.layer].upgrades.concat([11,12,13,14,21,22,23,24]);
        if (hasMilestone('dark',1)) player[this.layer].upgrades = player[this.layer].upgrades.concat([31,32]);
        if (hasUpgrade('dark', 23)&&(resettingLayer=="light"||resettingLayer=="dark")) player[this.layer].upgrades.push(34);
        if (hasAchievement('a',21)) player[this.layer].upgrades.push(41);
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
        unlocked() { return hasUpgrade("mem", 11)||hasMilestone('light',1) },
        effect() {
            let eff=player[this.layer].points.add(1).pow(0.25);
            if (hasUpgrade('mem', 32)) eff=eff.pow(1.25);
            return eff;
        }
        },
        13:{ title: "Algorithm Managing",
        description: "Lower Fragments requirement for further Memories",
        cost: new Decimal(10),
        unlocked() { return hasUpgrade("mem", 12)||hasMilestone('light',1) },
        effect() {
            let eff=new Decimal(1.25);
            if (hasUpgrade('mem', 23)) eff=eff.pow(upgradeEffect('mem', 23));
            return eff;
        },
        },
        14:{ title: "Fragments Duplication",
        description: "Fragments generation is boosted by Fragments",
        cost: new Decimal(20),
        unlocked() { return hasUpgrade("mem", 13)||hasMilestone('light',1) },
        effect() {
            return player.points.plus(1).log10().pow(0.75).plus(1)
        }
        },
        21:{ title: "Thought Combination",
        description: "Thought Collect is much faster",
        cost: new Decimal(30),
        unlocked() { return hasUpgrade("mem", 14)||hasMilestone('light',1)},
        effect() {
            let eff= new Decimal(2);
            if (hasUpgrade('mem', 31)) eff=eff.pow(upgradeEffect('mem', 31));
            return eff
        }
        },
        22:{ title: "Fragments Prediction",
        description: "Fragments generation is boosted by Memories",
        cost: new Decimal(50),
        unlocked() { return hasUpgrade("mem", 21)||hasMilestone('light',1) },
        effect() {
            return player[this.layer].points.add(1).pow(0.5)
        }
        },
        23:{ title: "Time Boosting",
        description: "Algorithm Managing is effected by Fragments.",
        cost: new Decimal(100),
        unlocked() { return hasUpgrade("mem", 22)||hasMilestone('light',1) },
        effect() {
            return player.points.plus(1).times(1.5).log10().log10(2).pow(0.01).plus(1)
        }
        },
        24:{ title: "Directly Drown",
        description: "Memories gain is boosted by Fragments.",
        cost: new Decimal(1000),
        unlocked() { return hasUpgrade("mem", 23)||hasMilestone('light',1) },
        effect() {
            return player.points.pow(0.05).plus(1).log10().plus(2).log10(5).plus(1);
        }
        },
        31:{ title: "Thought Growth",
        description: "Thought Combination is boosted by Memories",
        cost: new Decimal(20000),
        unlocked() { return hasUpgrade("mem", 24)||hasMilestone('dark',1) },
        effect() {
            return player[this.layer].points.plus(1).log10().pow(0.5).log10(2);
        },
        },
        32:{ title: "Memory Inflation",
        description: "Memory Extraction is much faster.",
        cost: new Decimal(50000),
        unlocked() { return hasUpgrade("mem", 31)||hasMilestone('dark',1) },
        },
        33:{ title: "Directly Transfer",
        description: "Memories gain is massively boosted, but with Fragments gain massively decreased and Fragments&Memories set to 1.",
        cost: new Decimal(1000000),
        unlocked() { return hasUpgrade("mem", 32)},
        effect() {//Mem, not Frag
            let eff = new Decimal(1.5);
            if (hasUpgrade("light", 33)) eff=eff.add(upgradeEffect('light', 33))
            return eff;
        },
        onPurchase(){player.points=new Decimal(1);player[this.layer].points = new Decimal(1);},
        },
        34:{ title: "Conclusion",
        description: "Unlock two new layers, but with Memories gain decreased and Fragments&Memories set to 1.",
        cost: new Decimal(10000000),
        unlocked() { return (hasUpgrade("mem", 33)||hasUpgrade("dark",23))},
        onPurchase(){player.points=new Decimal(1);player[this.layer].points = new Decimal(1);},
        },
        41:{ title: "Build Up The Core.",
        fullDisplay(){
            if(hasAchievement('a',21)) return "<b>Eternal Core</b></br>A core build up by massive Memories and a little Lights&Darks, which contains nearly endless energy.";
            return "<b>Build Up The Core.</b></br>Unlock two new layers, but sacrifice all your progresses.</br></br>Cost:1e23 Memories</br>65 Light Tachyons</br>65 Dark Matters"
        },
        description: "Unlock two new layers, but sacrifice all your progresses.",
        canAfford(){return player[this.layer].points.gte(1e23)&&player.dark.points.gte(65)&&player.light.points.gte(65)},
        pay(){
            player[this.layer].points = player[this.layer].points.sub(1e23);
            player.dark.points = player.dark.points.sub(65);
            player.light.points = player.light.points.sub(65);
        },
        unlocked() { return ( (hasUpgrade("dark", 34)&&hasUpgrade("light",34)&&player.dark.points.gte(60)&&player.light.points.gte(60)) || hasAchievement('a',21))},
        style(){return {'height':'200px', 'width':'200px'}},
        onPurchase(){doReset('kou',true);showTab('none');player[this.layer].upgrades=[41];},
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
        best:new Decimal(0),
        total:new Decimal(0),
        unlockOrder:0,
        auto: false,
    }},
    unlockOrder(){return (hasAchievement('a',14)?0:player[this.layer].unlockOrder);},
    color: "#ededed",
    requires(){return new Decimal(2e8).times((player.light.unlockOrder&&!player.light.unlocked)?100:1)}, // Can be a function that takes requirement increases into account
    resource: "Light Tachyons", // Name of prestige currency
    baseResource: "Memories", // Name of resource prestige is based on
    baseAmount() {return player.mem.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent() {
        let ex = new Decimal(1.25);
        if (hasUpgrade('light', 22)) ex=ex.plus(-0.15);
        if (hasUpgrade('light', 34)) ex=ex.plus(-0.05);
        return ex;
    }, // Prestige currency exponent
    base:1.75,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade("light", 13)) mult=mult.div(tmp.light.effect.pow(0.15));
        if (hasUpgrade("light", 14)) mult=mult.div(upgradeEffect('light', 14));
        if (hasUpgrade("dark", 24)) mult=mult.div(tmp.dark.effect);
        if (hasUpgrade('dark', 34)) mult=mult.div(upgradeEffect('dark', 34));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);
        return exp
    },
    directMult(){
        let dm=new Decimal(1);
        if (player.kou.unlocked) dm=dm.times(tmp.kou.effect);
        return dm;
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 1,
    hotkeys: [
        {key: "l", description: "L: Reset for Light Tachyons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('mem', 34)||hasMilestone("light", 0)},
    increaseUnlockOrder: ["dark"],

    milestones: {
        0: {
            requirementDescription: "1 Light Tachyon",
            done() { return player.light.best.gte(1)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "This Layer no longer hidden.",
        },
        1: {
            requirementDescription: "8 Light Tachyons",
            done() { return player.light.best.gte(8)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "Keep all your row1&row2 Memory upgrades when L or D reset.",
        },
        2: {
            requirementDescription: "15 Light Tachyons",
            done() { return player.light.best.gte(15)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "Make Memories gain After softcap's exponent +0.02.",
        },
        3: {
            requirementDescription: "30 Light Tachyons",
            done() { return player.light.best.gte(30)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "Gain 5% of Memories gain every second.",
        },
    },

    doReset(resettingLayer){
        let keep=[];
        if (layers[resettingLayer].row > this.row) layerDataReset('light', keep);
        if (player.tab=='light'&&(!hasUpgrade('dark', 23)&&!hasMilestone('light',0))) showTab('none');
        if (hasMilestone('kou',0)&&(resettingLayer=='kou'||resettingLayer=='lethe')) {player[this.layer].upgrades.push(22);player[this.layer].milestones = player[this.layer].milestones.concat([0,1])};
        if (hasMilestone('kou',1)&&(resettingLayer=='kou'||resettingLayer=='lethe'))  player[this.layer].upgrades = player[this.layer].upgrades.concat([11,12,13,14]);
    },
    canBuyMax() { return hasUpgrade('light', 22) },

    effectBase(){
        let base = new Decimal(1.5);
        return base;
    },
    effect(){
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff=Decimal.times(tmp.light.effectBase,player.light.points.plus(1));
        if (hasUpgrade('light',31)) eff=eff.times(player[this.layer].points.sqrt());
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
        effect() {
            return (hasUpgrade('light',21))?new Decimal(0.95):new Decimal(0.9);
        },
        onPurchase(){if (hasAchievement('a',22)) player[this.layer].points = player[this.layer].points.plus(1);},
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
        14:{ title: "After That Butterfly",
        description: "Light Tachyons itself boosts its own gain.",
        unlocked() { return hasUpgrade("light", 13) },
        effect() {
            return player[this.layer].points.plus(1).log10().plus(1).pow(0.5);
        },
        cost: new Decimal(8),
        },
        21:{ title: "Seeking Delight.",
        description: "Conclusion decreases Memories gain more less, and gain ^0.33 instead of ^0.25 Memories after softcap.",
        unlocked() { return hasUpgrade("light", 14) },
        cost: new Decimal(10),
        },
        22:{ title: "More Brightness",
        description: "You can buy max Light Tachyons And lower Memories requirement for further Light Tachyons",
        unlocked() { return hasUpgrade("light", 21)||hasMilestone('kou',0) },
        cost: new Decimal(15),
        },
        23:{ title: "Fragment Sympathy",
        description: "Directly Transfer decreases Fragments gain less.",
        unlocked() { return hasUpgrade("light", 22) },
        cost: new Decimal(25),
        },
        24:{ title: "Sadness Overjoy",
        description: "Light Tachyons also effects Dark Matters gain.",
        unlocked() { return hasUpgrade("light", 23) },
        cost: new Decimal(30),
        },
        31:{ title: "Hardware BUS",
        description: "Light Tachyons effect formula now much better.",
        unlocked() { return hasUpgrade("light", 24) },
        cost: new Decimal(35),
        },
        32:{ title: "Moments Of Lifes",
        description: "Gain ^0.40 instead of ^0.33 Memories after softcap.",
        unlocked() { return hasUpgrade("light", 31) },
        cost: new Decimal(40),
        },
        33:{ title: "Prepare To Travel",
        description: "Light Tachyons itself now makes Directly Transfer boosts more Memories gain.",
        unlocked() { return hasUpgrade("light", 32) },
        effect() {
            let eff = player[this.layer].points.div(500);
            if (eff.lte(0.1)) return new Decimal(0.1);
            if (eff.gt(0.3)) return new Decimal(0.3);
            return eff;
        },
        cost: new Decimal(44),
        },
        34:{ title: "The Light",
        description: "Lower Memories requirement for further Light Tachyons, and Light Tachyons itself now boosts Dark Matters gain.",
        unlocked() { return hasUpgrade("light", 33) },
        effect() {
            let eff = player[this.layer].points.div(3);
            if (eff.lt(1.25)) return new Decimal(1.25);
            return eff;
        },
        cost: new Decimal(48),
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
        best:new Decimal(0),
        total:new Decimal(0),
        unlockOrder:0,
        auto: false,
    }},
    unlockOrder(){return (hasAchievement('a',14)?0:player[this.layer].unlockOrder);},
    color: "#383838",
    requires(){return new Decimal(9999).times((player.dark.unlockOrder&&!player.dark.unlocked)?5:1)}, // Can be a function that takes requirement increases into account
    resource: "Dark Matters", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent() {
        let ex = new Decimal(1.25);
        if (hasUpgrade('dark', 22)) ex=ex.plus(-0.15);
        if (hasUpgrade('dark', 34)) ex=ex.plus(-0.05);
        return ex;
    },  // Prestige currency exponent
    base:1.75,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("dark", 13)) mult=mult.div(tmp.dark.effect.pow(0.5));
        if (hasUpgrade("dark", 14)) mult=mult.div(upgradeEffect('dark', 14));
        if (hasUpgrade("light", 24)) mult=mult.div(tmp.light.effect);
        if (hasUpgrade("dark", 33)) mult=mult.div(upgradeEffect('dark', 33));
        if (hasUpgrade('light', 34)) mult=mult.div(upgradeEffect('light', 34));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1); 
        return exp;
    },

    directMult(){
        let dm=new Decimal(1);
        if (player.kou.unlocked) dm=dm.times(tmp.kou.effect);
        return dm;
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 1,
    hotkeys: [
        {key: "d", description: "D: Reset for Dark Matters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('mem', 34)||hasMilestone('dark',0)},
    increaseUnlockOrder: ["light"],

    milestones: {
        0: {
            requirementDescription: "1 Dark Matter",
            done() { return player.dark.best.gte(1)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "This Layer no longer hidden.",
        },
        1: {
            requirementDescription: "8 Dark Matters",
            done() { return player.dark.best.gte(8)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "Keep your first two Memory upgrades on row 3 when L or D reset.",
        },
        2: {
            requirementDescription: "15 Dark Matters",
            done() { return player.dark.best.gte(15)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "Dark Matters' affection now also makes Memory softcap starts later.",
        },
        3: {
            requirementDescription: "30 Dark Matters",
            done() { return player.dark.best.gte(30)&&hasAchievement('a',21)},
            unlocked(){return hasAchievement('a',21)},
            effectDescription: "Gain 5% of Memories gain every second.",
        },
    },

    doReset(resettingLayer){
        let keep=[];
        if (layers[resettingLayer].row > this.row) layerDataReset('dark', keep);
        if (player.tab=='dark'&&(!hasUpgrade('dark', 23)&&!hasMilestone('dark',0))) showTab('none');
        if (hasMilestone('lethe',0)&&(resettingLayer=='kou'||resettingLayer=='lethe')) {player[this.layer].upgrades.push(22);player[this.layer].milestones = player[this.layer].milestones.concat([0,1])};
        if (hasMilestone('lethe',1)&&(resettingLayer=='kou'||resettingLayer=='lethe'))  player[this.layer].upgrades = player[this.layer].upgrades.concat([11,12,13,14]);
    },
    canBuyMax() { return hasUpgrade('dark', 22) },

    effectBase(){
        let base = new Decimal(1.5);
        return base;
    },
    effect(){
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff=Decimal.pow(player[this.layer].points.plus(1).log10().plus(1),tmp.dark.effectBase);
        if (hasUpgrade('dark', 31)) eff = Decimal.pow(player[this.layer].points.plus(1).times(2).sqrt().plus(1),tmp.dark.effectBase);
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
        effect() {
            let eff = new Decimal(9999);
            if (hasUpgrade('dark',21)) eff=eff.times(upgradeEffect('dark',21));
            return eff;
        },
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
        14:{ title: "Wrath In Calm",
        description: "Dark Matters itself boosts its own gain.",
        unlocked() { return hasUpgrade("dark", 13) },
        effect() {
            return player[this.layer].points.plus(1).log10().plus(1).pow(0.5);
        },
        cost: new Decimal(8),
        },
        21:{ title: "Power Override",
        description: "Overclock ends at 19,998 and Memories softcap starts 50x later.",
        unlocked() { return hasUpgrade("dark", 14) },
        effect() {
            return new Decimal(2);
        },
        cost: new Decimal(10),
        },
        22:{ title: "More Darkness",
        description: "You can buy max Dark Matters And lower Fragments requirement for further Dark Matters",
        unlocked() { return hasUpgrade("dark", 21)||hasMilestone('lethe',0)},
        cost: new Decimal(15),
        },
        23:{ title: "Force Operation",
        description: "Keep Conclusion upgrade when L or D reset.",
        unlocked() { return hasUpgrade("dark", 22)&&hasUpgrade("light", 21) },
        onPurchase(){if (hasAchievement('a',22)) player[this.layer].points = player[this.layer].points.plus(25);player.mem.upgrades.push(34)},
        cost: new Decimal(25),
        },
        24:{ title: "Calm in Warth",
        description: "Dark Matters also effects Light Tachyons gain.",
        unlocked() { return hasUpgrade("dark", 23) },
        cost: new Decimal(30),
        },
        31:{ title: "Memory Organizing",
        description: "Dark Matters effect formula now much better.",
        unlocked() { return hasUpgrade("dark", 24) },
        cost: new Decimal(35),
        },
        32:{ title: "Moments Of Anger",
        description: "Dark Matters itself makes Memories softcap starts later.",
        unlocked() { return hasUpgrade("dark", 31) },
        effect() {
            let eff = player[this.layer].points.div(2);
            if (eff.lt(1.5)) return new Decimal(1.5);
            return eff;
        },
        cost: new Decimal(40),
        },
        33:{ title: "Prepare To Bleed",
        description: "Achievements now boost Dark Matters gain.",
        unlocked() { return hasUpgrade("dark", 32) },
        effect() {
            let eff = player.a.achievements.length;
            if (eff<= 1) return new Decimal(1);
            return eff;
        },
        cost: new Decimal(44),
        },
        34:{ title: "The Dark",
        description: "Lower Fragments requirement for further Dark Matters, and Dark Matters itself now boosts Light Tachyons gain.",
        unlocked() { return hasUpgrade("dark", 33) },
        effect() {
            let eff = player[this.layer].points.div(3);
            if (eff.lt(1.25)) return new Decimal(1.25);
            return eff;
        },
        cost: new Decimal(48),
        },
    }
})

addLayer("kou", {
    name: "Red dolls", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best:new Decimal(0),
        total:new Decimal(0),
        unlockOrder:0,
    }},
    color: "#ffa0be",
    requires(){return new Decimal(1e30)}, // Can be a function that takes requirement increases into account
    resource: "Red dolls", // Name of prestige currency
    baseResource: "Memories", // Name of resource prestige is based on
    baseAmount() {return player.mem.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["light"],
    base:2,
    exponent() {
        let ex = new Decimal(1.5);
        return ex;
    },  // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)//不要忘了这里是static层
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1); 
        return exp;
    },

    effectBase:1.5,

    effect(){
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff=new Decimal(player[this.layer].points.times(0.1).plus(1));
        return eff;
    },
    effectDescription() {
        return "which are directly boosting Light Tachyons and Dark Matters gain by "+format(tmp.kou.effect)+"x"
    },

    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    hotkeys: [
        {key: "r", description: "R: Reset for Red dolls", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasAchievement('a',21)},

    milestones: {
        0: {
            requirementDescription: "1 Red doll",
            done() { return player.kou.best.gte(1)},
            unlocked(){return player.kou.unlocked},
            effectDescription: "Keep first two Milestones and More Brightness upgrades of Light Tachyon layers when R or F reset.",
        },
        1: {
            requirementDescription: "2 Red dolls",
            done() { return player.kou.best.gte(2)},
            unlocked(){return player.kou.unlocked},
            effectDescription: "Keep first row upgrades of Light Tachyon layers when R or F reset.",
        },
    },

    tabFormat: {
        "Milestones": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                ["display-text",
                    function() {return 'You have ' + formatWhole(player.mem.points)+' Memories.'},
                        {}],
                "blank",
                ["display-text",
                    function() {return 'Your best Red Dolls is ' + formatWhole(player.kou.best)},
                        {}],
                ["display-text",
                    function() {return 'You have made a total of ' + formatWhole(player.kou.total) + ' Red Dolls'},
                        {}],
                "blank",
                "milestones",]
        },
        "Happiness Challenges": {
            unlocked() { return true },
            buttonStyle() { return {'background-color': '#bd003c'} },
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                ["display-text",
                    function() {return 'You have ' + formatWhole(player.mem.points)+' Memories.'},
                        {}],
                "blank",]
        },
    },
    upgrades:{
    }
})

addLayer("lethe", {
    name: "Forgotten Drops", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        unlockOrder:0,
    }},
    color: "#fee85d",
    requires(){return new Decimal(2e20)}, // Can be a function that takes requirement increases into account
    resource: "Forgotten Drops", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["dark"],
    exponent() {
        let ex = new Decimal(0.6);
        return ex;
    },  // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1); 
        return exp;
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,

    milestones: {
        0: {
            requirementDescription: "1 Forgotten Drop",
            done() { return player.lethe.best.gte(1)},
            unlocked(){return player.lethe.unlocked},
            effectDescription: "Keep first two Milestones and More Darkness upgrades of Dark Matter layers when R or F reset.",
        },
        1: {
            requirementDescription: "10 Forgotten Drops",
            done() { return player.kou.best.gte(10)},
            unlocked(){return player.kou.unlocked},
            effectDescription: "Keep first row upgrades of Dark Matter layers when R or F reset.",
        },
    },

    hotkeys: [
        {key: "f", description: "F: Reset for Forgotten Drops", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasAchievement('a',21)},

    effectBase(){
        let base = new Decimal(1.5);
        return base;
    },
    effect(){
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff = player[this.layer].points.plus(1).pow(2).log10().plus(1);
        return eff;
    },
    effectDescription() 
    {
        return "which are directly boosting Fragments generation and Memories gain by "+format(tmp.lethe.effect)+"x"
    },
    upgrades:{
    }
})


//GHOSTS

addNode("ghost1", {
    name: "ghost1", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G1", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    canclick(){return false},
    row: 0,
    color: "#000000",
    layerShown() {return "ghost";}
})
addNode("ghost2", {
    name: "ghost2", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G2", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    canclick(){return false},
    row: 0,
    color: "#000000",
    layerShown() {return "ghost";}
})
addNode("ghost3", {
    name: "ghost3", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G3", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    canclick(){return false},
    row: 0,
    color: "#000000",
    layerShown() {return "ghost";}
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
        14: {
            name: "Define Aspects.",
            done() { return player.light.unlocked&&player.dark.unlocked},
            tooltip: "Unlock Both Light And Dark Layers.<br>Rewards:They behave as they are unlocked first.",
        },
        15: {
            name: "Does Anybody Say sth About Softcap?",
            done() { return tmp['mem'].softcap.gte(1e13)},
            tooltip: "Push Memory Softcap starts x1,000 later.<br>Rewards:Memories gain x1.5, regardless of softcap.",
        },
        21: {
            name: "Eternal Core",
            done() { return hasUpgrade('mem',41)},
            tooltip: "Build up the Core.<br>Rewards:Unlock L&D milestones and you won't lose Eternal Core.",
        },
        22: {
            name: "Define Aspects™.",
            done() { return hasMilestone('light',0)&&hasMilestone('dark',0)},
            tooltip: "Reach L&D's 1st milestone.<br>Rewards:Conclusion no longer decreases Memories gain.Optimistic Thoughts&Force Operation will always give back its cost.",
        },
        23: {
            name: "Now You Are Useless.",
            done() { return hasAchievement('a',22)&&hasUpgrade('mem',34)},
            tooltip: "Buy Conclusion When it is useless.<br>Rewards:When you brought Conclusion, it makes your Memory softcap start later but effect reduces based on your Time since Memory Reset.",
        },
        24: {
            name: "Eternal Core^2",
            done() { return hasAchievement('a',21)&&(player.mem.points.gte(1e23)&&player.light.points.gte(65)&&player.dark.points.gte(65))},
            tooltip: "Make you can afford Eternal Core again after you have it.",
        },
        25: {
            name: "Stacks^Stacks",
            done() { return player.points.gte(9.99e18)},
            tooltip: "Gain 9.99e18 Fragments.<br>Rewards:Fragments now make Memory softcap starts later.",
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

addLayer("ab", {
	startData() { return {unlocked: true}},
	color: "yellow",
	symbol: "AB",
	row: "side",
	layerShown() { return hasAchievement('a',21) },
	tooltip: "Autobuyers",
	clickables: {
		//rows: 6,
		//cols: 4,
		/*11: {
			title: "Light Tachyons",
			display(){
				return hasMilestone("light", 2)?(player.light.auto?"On":"Off"):"Locked"
			},
			unlocked() { return player.light.layerShown&&hasAchievement('a',21) },
			canClick() { return hasMilestone("light", 2) },
			onClick() { player.light.auto = !player.light.auto },
			style: {"background-color"() { return player.light.auto?"#ededed":"#666666" }},
		    },
        12: {
			title: "Dark Matters",
			display(){
				return hasMilestone("dark", 2)?(player.dark.auto?"On":"Off"):"Locked"
			},
			unlocked() { return player.dark.layerShown&&hasAchievement('a',21) },
			canClick() { return hasMilestone("light", 2) },
			onClick() { player.dark.auto = !player.dark.auto },
			style: {"background-color"() { return player.dark.auto?"#383838":"#666666" }},
		    },*/
	        },
        }
)
