import LevelScene from "./levelScene";
import GameDataStorage, { GameConfig } from "../common/module/gameDataManager";

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

    private priceOfArrow: cc.Label = null;
    private priceOfBarrack: cc.Label = null;
    private priceOfMagiclan: cc.Label = null;
    private priceOfArtillery: cc.Label = null;
    private priceOfUpgrade: cc.Label = null;
    private priceOfSale: cc.Label = null;


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
    /**
     * 各种塔的数据
     * arrowTower,artillery,barrack,magiclan
     */
    private dataOfTower: any[] = [];
    /**
     * 卖塔金币回收率
     */
    private rateOfSale: number;

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

        let gc: GameConfig = GameDataStorage.getGameConfig();

        this.dataOfTower.push(gc.getDataOfArrowTower());
        this.dataOfTower.push(gc.getDataOfArtillery());
        this.dataOfTower.push(gc.getDataOfBarrack());
        this.dataOfTower.push(gc.getDataOfMagiclan());

        this.priceOfArrow = this.g1.getChildByName("arrow").getChildByName("price").getComponent(cc.Label);
        this.priceOfBarrack = this.g1.getChildByName("barrack").getChildByName("price").getComponent(cc.Label);
        this.priceOfMagiclan = this.g1.getChildByName("magiclan").getChildByName("price").getComponent(cc.Label);
        this.priceOfArtillery = this.g1.getChildByName("artillery").getChildByName("price").getComponent(cc.Label);
        this.priceOfUpgrade = this.g2.getChildByName("upgrade").getChildByName("price").getComponent(cc.Label);
        this.priceOfSale = this.g2.getChildByName("sale").getChildByName("price").getComponent(cc.Label);

        this.rateOfSale = gc.getRateOfSale();
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

        this.node.zIndex = 10;

        this.buildFace.active = true;
        if (this.tower === null) {
            this.refreshPriceOfBuild();
            this.g1.active = true;
        }
        else { //有塔
            this.refreshPriceOfUpOrSele();
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
     * 刷新各塔的建造价格
     */
    private refreshPriceOfBuild() {
        this.setLabelInCase(this.priceOfArrow, this.dataOfTower[0][0].price);
        this.setLabelInCase(this.priceOfArtillery, this.dataOfTower[1][0].price);
        this.setLabelInCase(this.priceOfBarrack, this.dataOfTower[2][0].price);
        this.setLabelInCase(this.priceOfMagiclan, this.dataOfTower[3][0].price);
    }
    /**
     * 刷新升级塔和卖塔的价格
     */
    private refreshPriceOfUpOrSele() {
        if (this.tower === null) {
            cc.error("[ERROR] 升级或卖塔时，发现塔为null。请处理！");
            return;
        }

        let d: any = this.tower.getDataOfTower();

        //升级按钮
        if (this.tower.level < d.length)
            this.setLabelInCase(this.priceOfUpgrade, d[this.tower.level].price);

        //出售按钮
        let p: number = d[this.tower.level - 1].price;
        this.priceOfSale.string = Math.floor(p * this.rateOfSale).toString();
    }
    /**
     * 根据操作价格与已有金币设置label
     * @param l Label
     * @param p 建筑价格
     */
    private setLabelInCase(l: cc.Label, p: number) {
        let havedCash: number = this.levelScene.cash;
        l.string = p.toString();
        if (p > havedCash)
            l.node.color = cc.Color.RED;
        else
            l.node.color = cc.Color.WHITE;
    }

    /**
     * 隐藏buildFace
     */
    hiddenBuildFace() {
        if (this.playingHiddenBuildFace)
            return;
        this.playingHiddenBuildFace = true;

        this.node.zIndex = 0;

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
        let cost: number = this.dataOfTower[0][0].price;
        this.buildTower(this.arrowTower, "arrowTower", cost);
    }

    buildArtilleryTower() {
        let cost: number = this.dataOfTower[1][0].price;
        this.buildTower(this.artilleryTower, "artilleryTower", cost);
    }

    buildMagiclanTower() {
        let cost: number = this.dataOfTower[3][0].price;
        this.buildTower(this.magiclanTower, "magiclanTower", cost);
    }

    buildBarrackTower() {
        let cost: number = this.dataOfTower[2][0].price;
        if (this.buildTower(this.barrackTower, "barrack", cost))
            this.tower.stationOfSoldier = this.stationOfSoldier[this.num];
    }

    /**
     * Builds tower
     * @param towerPrefab 
     * @param component 
     * @param cost 花费金币
     * @returns 金币不够，创建失败返回false
     */
    private buildTower(towerPrefab: cc.Prefab, component: string, cost: number): boolean {
        if (!this.levelScene.subCash(cost))
            return false;

        this.tower = cc.instantiate(towerPrefab).getComponent(component);
        this.towerMap.addChild(this.tower.node);
        this.tower.node.setPosition(this.node.getPosition());

        this.land.opacity = 0;
        this.hiddenBuildFaceImmediately();
        this.scheduleOnce(this.drawShootRange.bind(this), 0.5);
        return true;
    }

    saleTower() {
        this.levelScene.addCash(this.tower.price * this.rateOfSale);

        this.deleteTower();
        this.hiddenBuildFaceImmediately();
        this.g.clear();
    }

    upTower() {
        let havedCash: number = this.levelScene.cash;
        let cost: number = this.tower.getPriceOfUpgrade();
        if (havedCash < cost)
            return;

        this.levelScene.subCash(cost);
        this.tower.upgrade();
        this.drawShootRange();
        if (this.tower.level === this.tower.maxLevel) {
            this.upgrade.interactable = false;
            return;
        }

        this.refreshPriceOfUpOrSele();
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
        if (this.tower.shootRange === undefined)
            return;

        this.g.clear();
        this.g.circle(0, 0, this.tower.shootRange);
        this.g.stroke();
        this.g.fill();
    }

    // update (dt) {}
}
