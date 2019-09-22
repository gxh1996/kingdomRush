import FrameAnimation from "../../../common/frameAnimation";
import MagiclanBullet from "./magiclanBullet";

const { ccclass, property } = cc._decorator;

@ccclass("MagiclanFrames")
class MagiclanFrames {
    @property({
        type: [cc.SpriteFrame]
    })
    frames: cc.SpriteFrame[] = [];
}

@ccclass
export default class ArrowTower extends cc.Component {

    @property({
        type: [cc.Vec2],
        tooltip: "各等级的法师的Y坐标"
    })
    private offsetY: cc.Vec2[] = [];

    @property({
        type: [MagiclanFrames],
        tooltip: "它的帧图片"
    })
    private framesArray: MagiclanFrames[] = [];

    @property({ //0,1为 法师1的朝下和朝上的帧图片
        type: [MagiclanFrames],
        tooltip: "法师的帧图片"
    })
    private magiclanFrames: MagiclanFrames[] = [];


    @property({
        type: cc.Prefab
    })
    private bulletPrefab: cc.Prefab = null;


    /**
     * 塔的等级
     */
    private level: number = 1;
    /**
     * 法师的 帧动画组件
     */
    private magiclanAF: FrameAnimation = null;
    /**
     * 塔的 帧动画
     */
    private towerAF: FrameAnimation = null;
    /**
     * false为法师朝下
     */
    private toward: boolean = false;
    private bg: cc.Node = null;
    private isShoot: boolean = false;
    onLoad() {
        this.magiclanAF = this.node.getChildByName("magiclan").getComponent("frameAnimation");
        this.towerAF = this.node.getChildByName("bg").getComponent("frameAnimation");
        this.bg = this.node.getChildByName("bg");
    }

    start() {
        this.init();
    }

    /**
     * 根据塔的类型和等级 设置塔的图片和骨骼动画
     * @param level 塔的等级
     */
    private init() {
        this.initMagiclanAF();
        this.initTowerAF();
    }

    getLevel(): number {
        return this.level;
    }

    /**
     * 初始化 法师的 帧动画
     */
    private initMagiclanAF() {
        let i: number;
        if (this.level === 4) {
            i = 2;
        }
        else {
            i = 0;
        }
        if (this.toward)
            i++;
        this.magiclanAF.setFrameArray(this.magiclanFrames[i].frames);
        this.magiclanAF.setSpriteFrame(this.magiclanFrames[i].frames[0]);
        this.magiclanAF.node.setPosition(this.offsetY[this.level - 1]);
    }

    /**
     * 改变法师的朝向
     * @param toward false为 朝下
     */
    private changeToward(toward: boolean) {
        if (toward === this.toward)
            return;
        this.toward = toward;
        this.initMagiclanAF();
    }

    /**
     * 初始化塔的 帧动画
     */
    private initTowerAF() {
        this.towerAF.setFrameArray(this.framesArray[this.level - 1].frames);
        this.towerAF.setSpriteFrame(this.framesArray[this.level - 1].frames[0]);
    }

    /**
     * Shoots arrow tower
     * @param des 世界坐标
     */
    private shoot(des: cc.Vec2) {
        if (this.isShoot)
            return;
        this.isShoot = true;

        let wPos: cc.Vec2 = this.node.convertToWorldSpaceAR(this.magiclanAF.node.getPosition());
        if (wPos.y > des.y && this.toward === true)
            this.toward = false;
        else if (wPos.y < des.y && this.toward === false)
            this.toward = true;
        this.initMagiclanAF();

        this.magiclanAF.play(false);
        this.towerAF.play(false);
        this.scheduleOnce(function () {
            let bulletScr: MagiclanBullet = this.createBullet();
            bulletScr.moveTo(this.node.convertToWorldSpaceAR(cc.v2(-4, 7)), des);
        }.bind(this), 0.6);

    }

    private createBullet(): MagiclanBullet {
        let bullet: cc.Node = cc.instantiate(this.bulletPrefab);
        let script: MagiclanBullet = bullet.getComponent("magiclanBullet");
        script.init(200, 10);
        this.node.addChild(bullet);
        return script;
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
    // update (dt) {}
}
