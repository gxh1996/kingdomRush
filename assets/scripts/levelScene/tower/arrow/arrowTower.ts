import FrameAnimation from "../../../common/frameAnimation";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";
import Monster from "../../monster/monster";
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
        type: cc.Node
    })
    private graphics: cc.Node = null;

    /**
     * 塔的等级
     */
    private level: number = 1;
    private leftArrower: Arrower = null;
    private rightArrower: Arrower = null;
    /**
     * 左右两个士兵的 帧动画组件
     */
    private towerBG: cc.Sprite = null;
    private frameAnimations: FrameAnimation[] = [];
    /**
     * false为士兵朝下
     */
    private toward: boolean = false;
    private gameConfig: GameConfig;
    private attacks: number[];
    private attack: number;
    /**
     * 箭的速度
     */
    private speedOfArrow: number = 200;
    private wPos: cc.Vec2;
    private shootRange: number = 150;
    /**
     * 射手射速
     */
    private speedOfShoot: number = 1;

    onLoad() {
        let l: cc.Node = this.node.getChildByName("leftPerson");
        let r: cc.Node = this.node.getChildByName("rightPerson");
        this.frameAnimations[0] = l.getComponent("frameAnimation");
        this.frameAnimations[1] = r.getComponent("frameAnimation");
        this.leftArrower = l.getComponent("arrower")
        this.rightArrower = r.getComponent("arrower")
        this.towerBG = this.node.getChildByName("bg").getComponent(cc.Sprite);
        this.gameConfig = GameDataStorage.getGameConfig();
        this.attacks = this.gameConfig.getTowerAttackArray()[0];

    }

    start() {
        this.wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        this.init();
    }

    private init() {
        this.initArrower();
        this.showShootRange();
    }

    getLevel(): number {
        return this.level;
    }

    /**
     * 在屏幕上显示射程范围
     */
    private showShootRange() {
        let g: cc.Graphics = this.graphics.addComponent(cc.Graphics);
        g.strokeColor = g.fillColor = new cc.Color(0, 100, 0, 50);
        g.circle(0, 0, this.shootRange);
        g.stroke();
        g.fill();
    }

    private initArrower() {
        //设置位置和图片
        this.frameAnimations[0].node.y = this.offsetY[this.level - 1].y;
        this.frameAnimations[1].node.y = this.offsetY[this.level - 1].y;
        this.attack = this.attacks[this.level - 1];
        let dir: string = "textures/levelScene/tower/" + "arrowTower/" + "arrow" + this.level.toString()
        cc.loader.loadResDir(dir, cc.SpriteFrame, function (e, res, url: string[]) {
            //设置塔的皮肤
            this.towerBG.spriteFrame = res[0];
            this.setSkin(this.frameAnimations[0], res);
            this.setSkin(this.frameAnimations[1], res);
        }.bind(this));

        //传参
        this.leftArrower.init(this.wPos, this.speedOfArrow, this.shootRange, this.speedOfShoot);
        this.rightArrower.init(this.wPos, this.speedOfArrow, this.shootRange, this.speedOfShoot);
    }


    /**
     * 设置士兵的皮肤和帧动画
     * @param frameAnimation 
     * @param res 图片资源
     */
    private setSkin(frameAnimation: FrameAnimation, res) {
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
        this.node.removeFromParent();
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



    update(dt) {

    }
}
