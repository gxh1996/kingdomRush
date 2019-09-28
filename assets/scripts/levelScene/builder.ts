import LevelScene from "./levelScene";

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

    @property({
        type: cc.Node,
    })
    private graphics: cc.Node = null;

    /**
     * 建筑塔面板
     */
    private buildFace: cc.Node = null;
    /**
     * 建造的塔
     */
    private tower = null;
    /**
     * 没建塔时显示4种建筑的建造按钮界面
     */
    private g1: cc.Node = null;
    /**
     * 建塔后显示的升级和卖出按钮界面
     */
    private g2: cc.Node = null;
    private upgrade: cc.Button = null;
    /**
     * 空地（背景）节点
     */
    private land: cc.Node = null;
    private towerMap: cc.Node = null;
    private levelScene: LevelScene = null;

    /* 数据 */
    /**
     * buildFace面板弹出和隐藏的时间
     */
    private timeOfFaceAction: number = 0.1;
    /**
     * builder编号
     */
    private num: number;
    private stationOfSoldier: cc.Vec2[][];

    /* 控制 */
    private playingOutBuildFace: boolean = false;
    private playingHiddenBuildFace: boolean = false;
    private g: cc.Graphics = null;

    onLoad() {
        this.buildFace = this.node.getChildByName("buildFace");
        this.g1 = this.buildFace.getChildByName("g1");
        this.g2 = this.buildFace.getChildByName("g2");
        this.upgrade = this.g2.getChildByName("upgrade").getComponent(cc.Button);
        this.land = this.node.getChildByName("land");
        this.towerMap = cc.find("Canvas/towerMap");
        this.levelScene = cc.find("Canvas").getComponent("levelScene");
        this.stationOfSoldier = this.levelScene.levelData.stationOfSoldier;
    }

    start() {

    }

    /**
     * 实例化加入父节点后必须执行
     * @param num builder编号
     */
    init(num: number) {
        this.g = this.graphics.addComponent(cc.Graphics);
        this.g.strokeColor = this.g.fillColor = new cc.Color(0, 100, 0, 50);

        this.num = num;
    }

    /**
     * 弹出buildFace
     */
    outBuildFace() {
        if (this.playingOutBuildFace)
            return;
        this.playingOutBuildFace = true;

        this.buildFace.active = true;
        if (this.tower === null) {
            this.g1.active = true;
        }
        else { //有塔
            if (this.tower.level === this.tower.maxLevel) //满级了
                this.upgrade.interactable = false;
            else
                this.upgrade.interactable = true;
            this.g2.active = true;
        }

        let a: cc.ActionInterval = cc.scaleTo(this.timeOfFaceAction, 1).easing(cc.easeBackOut());
        let func: cc.ActionInstant = cc.callFunc(function () { this.playingOutBuildFace = false; }, this);
        let seq: cc.ActionInterval = cc.sequence(a, func);
        this.buildFace.runAction(seq);

    }

    /**
     * 隐藏buildFace
     */
    hiddenBuildFace() {
        if (this.playingHiddenBuildFace)
            return;
        this.playingHiddenBuildFace = true;

        let a: cc.ActionInterval = cc.scaleTo(this.timeOfFaceAction, 0);
        this.buildFace.runAction(a);

        this.scheduleOnce(function () {
            this.buildFace.active = false;
            this.g1.active = false;
            this.g2.active = false;

            this.playingHiddenBuildFace = false;
        }.bind(this), this.timeOfFaceAction);
    }

    buildArrowTower() {
        this.buildTower(this.arrowTower, "arrowTower");
    }

    buildArtilleryTower() {
        this.buildTower(this.artilleryTower, "artilleryTower");
    }

    buildMagiclanTower() {
        this.buildTower(this.magiclanTower, "magiclanTower");
    }

    buildBarrackTower() {
        this.buildTower(this.barrackTower, "barrack");
        this.tower.stationOfSoldier = this.stationOfSoldier[this.num];
    }

    private buildTower(towerPrefab: cc.Prefab, component: string) {
        this.tower = cc.instantiate(towerPrefab).getComponent(component);
        this.towerMap.addChild(this.tower.node);
        this.tower.node.setPosition(this.node.getPosition());

        this.land.opacity = 0;
        this.hiddenBuildFaceImmediately();
        this.drawShootRange();
    }

    saleTower() {
        this.deleteTower();
        this.hiddenBuildFaceImmediately();
        this.g.clear();
    }

    upTower() {
        this.tower.upgrade();
        this.drawShootRange();
        if (this.tower.level === this.tower.maxLevel) //满级了
            this.upgrade.interactable = false;
    }

    /**
     * 立即隐藏BuildFace
     */
    hiddenBuildFaceImmediately() {
        this.buildFace.scale = 0;
        this.buildFace.active = false;
        this.g1.active = false;
        this.g2.active = false;
    }

    /**
     * 删除塔并将空地显示出来
     */
    deleteTower() {
        if (this.tower === null)
            return;
        this.tower.destroySelf();
        this.g.clear();
        this.tower = null;
        this.land.opacity = 255;
    }

    /**
    * 绘制射程范围
    */
    private drawShootRange() {
        this.g.clear();
        this.g.circle(0, 0, this.tower.shootRange);
        this.g.stroke();
        this.g.fill();
    }

    // update (dt) {}
}
