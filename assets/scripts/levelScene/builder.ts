const { ccclass, property } = cc._decorator;

@ccclass
export default class Builder extends cc.Component {

    @property({
        type: cc.Prefab,
    })
    private arrowTower: cc.Prefab = null;
    @property({
        type: cc.Prefab,
    })
    private barrackTower: cc.Prefab = null;
    @property({
        type: cc.Prefab,
    })
    private magiclanTower: cc.Prefab = null;
    @property({
        type: cc.Prefab,
    })
    private artilleryTower: cc.Prefab = null;


    private buildFace: cc.Node = null;
    private tower = null;
    private g1: cc.Node = null;
    private g2: cc.Node = null;
    private upgrade: cc.Button = null;
    private land: cc.Node = null;
    private towerMap: cc.Node = null;
    onLoad() {
        this.buildFace = this.node.getChildByName("buildFace");
        this.g1 = this.buildFace.getChildByName("g1");
        this.g2 = this.buildFace.getChildByName("g2");
        this.upgrade = this.g2.getChildByName("upgrade").getComponent(cc.Button);
        this.land = this.node.getChildByName("land");
        this.towerMap = cc.find("Canvas/towerMap");
    }

    start() {

    }

    /**
     * 弹出buildFace
     */
    outBuildFace() {
        this.buildFace.active = true;
        if (this.tower === null) {
            this.g1.active = true;
        }
        else { //有塔
            if (this.tower.getLevel() === 4) //满级了
                this.upgrade.interactable = false;
            else
                this.upgrade.interactable = true;
            this.g2.active = true;
        }

        let a: cc.ActionInterval = cc.scaleTo(0.1, 1).easing(cc.easeBackOut());
        this.buildFace.runAction(a);

    }

    /**
     * 隐藏buildFace
     */
    hiddenBuildFace() {
        let a: cc.ActionInterval = cc.scaleTo(0.1, 0);
        this.buildFace.runAction(a);
        this.scheduleOnce(function () {
            this.buildFace.active = false;
            this.g1.active = false;
            this.g2.active = false;
        }.bind(this), 0.4);
    }

    buildArrowTower() {
        this.tower = cc.instantiate(this.arrowTower).getComponent("arrowTower");
        this.towerMap.addChild(this.tower.node);
        this.tower.node.setPosition(this.node.getPosition());

        this.land.opacity = 0;
        this.buildFace.scale = 0;
        this.buildFace.active = false;
        this.g1.active = false;
        this.g2.active = false;
    }

    buildArtilleryTower() {
        this.tower = cc.instantiate(this.artilleryTower).getComponent("artilleryTower");
        this.towerMap.addChild(this.tower.node);
        this.tower.node.setPosition(this.node.getPosition());

        this.land.opacity = 0;
        this.buildFace.scale = 0;
        this.buildFace.active = false;
        this.g1.active = false;
        this.g2.active = false;
    }

    buildMagiclanTower() {
        this.tower = cc.instantiate(this.magiclanTower).getComponent("magiclanTower");
        this.towerMap.addChild(this.tower.node);
        this.tower.node.setPosition(this.node.getPosition());

        this.land.opacity = 0;
        this.buildFace.scale = 0;
        this.buildFace.active = false;
        this.g1.active = false;
        this.g2.active = false;
    }

    buildBarrackTower() {
        this.tower = cc.instantiate(this.barrackTower).getComponent("barrack");
        this.towerMap.addChild(this.tower.node);
        this.tower.node.setPosition(this.node.getPosition());

        this.land.opacity = 0;
        this.buildFace.scale = 0;
        this.buildFace.active = false;
        this.g1.active = false;
        this.g2.active = false;
    }

    saleTower() {
        this.tower.destroySelf();
        this.tower = null;
        this.land.opacity = 255;

        this.buildFace.scale = 0;
        this.buildFace.active = false;
        this.g1.active = false;
        this.g2.active = false;
    }

    upTower() {
        this.tower.upgrade();
        this.hiddenBuildFace();
    }

    // update (dt) {}
}
