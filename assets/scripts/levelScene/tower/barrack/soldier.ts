import FrameAnimation from "../../../common/frameAnimation";
import Move from "../../../common/move";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";

const { ccclass, property } = cc._decorator;

enum State { attack, dead, walk, idle };



@ccclass
export default class Soldier extends cc.Component {

    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级1的士兵攻击帧动画图片"
    })
    private soldier1Attack: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级1的士兵死亡帧动画图片"
    })
    private soldier1Dead: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级1的士兵行走帧动画图片"
    })
    private soldier1Walk: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级2的士兵攻击帧动画图片"
    })
    private soldier2Attack: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级2的士兵死亡帧动画图片"
    })
    private soldier2Dead: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级2的士兵行走帧动画图片"
    })
    private soldier2Walk: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级3的士兵攻击帧动画图片"
    })
    private soldier3Attack: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级3的士兵死亡帧动画图片"
    })
    private soldier3Dead: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级3的士兵行走帧动画图片"
    })
    private soldier3Walk: cc.SpriteFrame[] = [];

    @property({ type: cc.ProgressBar })
    private bloodBar: cc.ProgressBar = null;

    /**
     * [等级][攻击，死亡，行走][图片]
     */
    private frames = [];
    private level: number = 1;
    private attack: number = 0;
    private cHP: number = 0;
    private maxHP: number = 0;
    private state: State = State.idle;
    private BGFrameAnim: FrameAnimation = null;
    private move: Move = null;
    /**
     * 驻点 世界坐标
     */
    private station: cc.Vec2 = null;
    private isFindEnemy: boolean = false;
    private think = {
        goHome: false,
    }
    private gameConfig: GameConfig = null;
    private soldierData;
    onLoad() {
        this.BGFrameAnim = this.node.getChildByName("bg").getComponent("frameAnimation");
        this.move = this.node.getComponent("move");

        this.frames.push([this.soldier1Attack, this.soldier1Dead, this.soldier1Walk]);
        this.frames.push([this.soldier2Attack, this.soldier2Dead, this.soldier2Walk]);
        this.frames.push([this.soldier3Attack, this.soldier3Dead, this.soldier3Walk]);

        this.gameConfig = GameDataStorage.getGameConfig();
        this.soldierData = this.gameConfig.getSoldierData();
    }

    start() {
        this.init();
    }

    /**
     * Sets state
     * @param level  
     * @param station 驻点 世界坐标
     */
    setState(level: number, station: cc.Vec2) {
        this.level = level;
        this.station = station;
    }

    subHP(n: number) {
        this.cHP -= n;
        this.updateBloodBar();
    }

    private updateBloodBar() {
        let p: number = this.cHP / this.maxHP;
        this.bloodBar.progress = p;
    }

    private init() {
        let frames: cc.SpriteFrame[] = this.frames[this.level - 1][State.walk];
        this.BGFrameAnim.setIdle(frames[0]);
        this.BGFrameAnim.setSpriteFrame(frames[0]);
        this.state = State.idle;
        this.cHP = this.maxHP = this.soldierData[this.level - 1].HP;
        this.attack = this.soldierData[this.level - 1].attack;
        this.move.speed = this.soldierData[this.level - 1].speed;
    }

    /**
     * Walks to
     * @param des 世界坐标
     */
    private walkTo(des: cc.Vec2) {
        if (this.state !== State.walk) {
            let frame: cc.SpriteFrame[] = this.frames[this.level - 1][State.walk];
            this.BGFrameAnim.setFrameArray(frame);
            this.BGFrameAnim.setSpriteFrame(frame[0]);
            this.state = State.walk;
        }
        let nodeP: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(des);
        this.BGFrameAnim.play(true);
        this.move.startMove([nodeP], function () {
            this.BGFrameAnim.stop();
        }.bind(this))
    }

    private attackAnim() {
        //V
        if (this.state === State.walk)
            this.move.stopMove();
        if (this.state !== State.attack) {
            let frame: cc.SpriteFrame[] = this.frames[this.level - 1][State.attack];
            this.BGFrameAnim.setFrameArray(frame);
            this.state = State.attack;
        }
        this.BGFrameAnim.play(false);


    }

    /**
     * 死亡
     */
    private deadAnim() {
        //V
        if (this.state === State.walk)
            this.move.stopMove();
        if (this.state !== State.dead) {
            let frame: cc.SpriteFrame[] = this.frames[this.level - 1][State.dead];
            this.BGFrameAnim.setFrameArray(frame);
            this.state = State.dead;
        }
        this.BGFrameAnim.play(false);

        let a: cc.ActionInterval = cc.fadeOut(1);
        let func: cc.ActionInstant = cc.callFunc(function () {
            this.destroySelf();
        }, this);
        let seq: cc.ActionInterval = cc.sequence(a, func);
        this.node.runAction(seq);
    }

    /**
     * 是否在 驻点
     * @returns true if station 
     */
    private inStation(): boolean {
        let ret = false;
        let cP: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        if (cP === this.station)
            ret = true;
        return;
    }

    private destroySelf() {
        this.node.removeFromParent();
        this.node.destroy();
    }

    update(dt) {


        if (!this.isFindEnemy) {// 没有发现敌人
            if (!this.inStation()) {//不在驻点
                if (this.think.goHome === false) {//不在会驻点的路上，则返回驻点
                    this.think.goHome = true;
                    this.walkTo(this.station);
                }
            }
            else
                this.think.goHome = false;
        }
    }
}
