import FrameAnimation from "../../../common/frameAnimation";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";
import Arrower from "./arrower";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ArrowTower extends cc.Component {

    @property({
        type: [cc.Vec2],
        tooltip: "各等级的人的Y坐标"
    })
    private offsetY: cc.Vec2[] = [];

    @property({
        type: cc.Prefab
    })
    private arrowPrefab: cc.Prefab = null;

    @property([cc.SpriteAtlas])
    private atlas: cc.SpriteAtlas[] = [];

    /* 塔的属性 */
    /**
     * 塔的等级
     */
    level: number = 1;
    maxLevel: number = 4;
    private attack: number;
    /**
     * 箭的速度
     */
    private speedOfArrow: number;
    shootRange: number;
    /**
     * 射手射速
     */
    private speedOfShoot: number;
    price: number;

    private leftArrower: Arrower = null;
    private rightArrower: Arrower = null;
    /**
     * 左右两个士兵的 帧动画组件
     */
    private towerBG: cc.Sprite = null;
    private frameAnimations: FrameAnimation[] = [];
    private gameConfig: GameConfig;

    /* 控制 */
    /**
     * false为士兵朝下
     */
    private toward: boolean = false;

    /* 数据 */
    private wPos: cc.Vec2;
    private dataOfTower: any[] = null;
    private poolOfArrow: cc.NodePool = null;

    onLoad() {
        let l: cc.Node = this.node.getChildByName("leftPerson");
        let r: cc.Node = this.node.getChildByName("rightPerson");
        this.frameAnimations[0] = l.getComponent("frameAnimation");
        this.frameAnimations[1] = r.getComponent("frameAnimation");
        this.leftArrower = l.getComponent("arrower")
        this.rightArrower = r.getComponent("arrower")
        this.towerBG = this.node.getChildByName("bg").getComponent(cc.Sprite);
        this.gameConfig = GameDataStorage.getGameConfig();
        this.dataOfTower = this.gameConfig.getDataOfArrowTower();


        this.createPoolOfArrow();
    }

    start() {
        this.wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        this.init();
    }

    private init() {
        this.attack = this.dataOfTower[this.level - 1].attack;
        this.speedOfArrow = this.dataOfTower[this.level - 1].speedOfArrow;
        this.shootRange = this.dataOfTower[this.level - 1].shootRange;
        this.speedOfShoot = this.dataOfTower[this.level - 1].speedOfShoot;
        this.price = this.dataOfTower[this.level - 1].price;

        this.initArrower();
    }

    /* 箭对象池 */
    private createPoolOfArrow() {
        if (this.poolOfArrow !== null)
            return;
        this.poolOfArrow = new cc.NodePool();
        for (let i = 0; i < 2; i++) {
            this.poolOfArrow.put(cc.instantiate(this.arrowPrefab));
        }
    }
    getArrowBullet(): cc.Node {
        let r: cc.Node = null;
        if (this.poolOfArrow.size() > 0)
            r = this.poolOfArrow.get();
        else
            r = cc.instantiate(this.arrowPrefab);
        r.opacity = 255;
        return r;
    }
    releaseArrowBullt(n: cc.Node) {
        this.poolOfArrow.put(n);
    }
    private clearPoolOfArrow() {
        this.poolOfArrow.clear();
    }

    private initArrower() {
        //设置位置和图片
        this.frameAnimations[0].node.y = this.offsetY[this.level - 1].y;
        this.frameAnimations[1].node.y = this.offsetY[this.level - 1].y;
        let atlas: cc.SpriteAtlas = this.atlas[this.level - 1];
        let spriteArr: cc.SpriteFrame[] = atlas.getSpriteFrames();

        //设置塔的皮肤
        this.towerBG.spriteFrame = spriteArr[0];
        this.setSkin(this.frameAnimations[0], spriteArr);
        this.setSkin(this.frameAnimations[1], spriteArr);

        //传参
        this.leftArrower.init(this.wPos, this.speedOfArrow, this.shootRange, this.speedOfShoot, this.attack);
        this.rightArrower.init(this.wPos, this.speedOfArrow, this.shootRange, this.speedOfShoot, this.attack);
    }


    /**
     * 设置士兵的皮肤和帧动画
     * @param frameAnimation 
     * @param res 图片资源
     */
    private setSkin(frameAnimation: FrameAnimation, res: cc.SpriteFrame[]) {
        //设置士兵等待时的皮肤
        let i: number = 5; //朝下
        if (this.toward)
            i = 6
        frameAnimation.setSpriteFrame(res[i]);
        frameAnimation.setIdle(res[i]);

        //设置帧动画
        let arr: cc.SpriteFrame[] = [];
        i = 1;
        if (this.toward) //朝下
            i = 7;
        for (let j = 0; j < 4; j++)
            arr.push(res[i + j]);
        frameAnimation.setFrameArray(arr);
    }

    destroySelf() {
        this.clearPoolOfArrow();
        this.node.destroy();
    }

    /**
     * 升级
     */
    upgrade() {
        if (this.level === 4)
            return;
        this.level++;
        this.init();
    }

    getPriceOfUpgrade(): number {
        return this.dataOfTower[this.level].price;
    }

    getDataOfTower(): any[] {
        return this.dataOfTower;
    }

    update(dt) {

    }
}
