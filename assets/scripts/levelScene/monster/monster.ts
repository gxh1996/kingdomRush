import FrameAnimation from "../../common/frameAnimation";
import Move from "../../common/move";
import GameDataStorage, { GameConfig } from "../../common/module/gameDataManager";
import Walk from "../../common/walk";
import LevelScene from "../levelScene";

const { ccclass, property } = cc._decorator;


enum State { attack, dead, walk, idle };
@ccclass
export default class Monster extends cc.Component {

    @property({
        type: [cc.SpriteFrame],
        tooltip: "怪物攻击帧动画图片"
    })
    private attackFrame: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "怪物死亡帧动画图片"
    })
    private deadFrame: cc.SpriteFrame[] = [];

    @property({ type: cc.ProgressBar })
    private bloodBar: cc.ProgressBar = null;
    /**
     * 怪物编号
     */
    private number: number = null;
    private speed: number = 40;
    private attack: number = 5;
    private maxHP: number = 20;
    private cHP: number = 20;
    /**
     * 需要移动的路径 世界坐标
     */
    private movePath: cc.Vec2[];
    private state: State = State.idle;
    private bg: cc.Node = null;
    private BGFrameAnim: FrameAnimation = null;
    private gameConfig: GameConfig = null;
    private monsterData;
    private isFindEnemy: boolean = false;
    private walk: Walk;
    /**
     * 怪物列表
     */
    private monsterArray: Monster[];
    private levelScene: LevelScene = null;

    onLoad() {
        this.bg = this.node.getChildByName("bg");
        this.BGFrameAnim = this.bg.getComponent("frameAnimation");
        this.gameConfig = GameDataStorage.getGameConfig();
        this.monsterData = this.gameConfig.getMonsterData();
        this.walk = this.node.getComponent("walk");
        this.levelScene = cc.find("Canvas").getComponent("levelScene");
    }

    start() {
        this.init();
    }

    private init() {
        this.speed = this.monsterData[this.number].speed;
        this.cHP = this.maxHP = this.monsterData[this.number].HP;
        this.attack = this.monsterData[this.number].attack;

        this.state = State.walk;
        this.walk.startWalk(this.movePath, this.speed, function () {
            this.levelScene.subHP();
            this.destroySelf();
        }.bind(this));
    }

    getSpeed(): number {
        return this.speed;
    }

    getWalkScript(): Walk {
        return this.walk;
    }

    /**
     * Gets move path
     * @returns move path 世界坐标 
     */
    getMovePath(): cc.Vec2[] {
        return this.movePath;
    }

    /**
     * Sets
     * @param n 怪物编号
     * @param path 移动路径 世界坐标
     * @param monsterArray 怪物列表
     */
    set(n: number, path: cc.Vec2[], monsterArray) {
        this.number = n;
        this.movePath = path;
        this.monsterArray = monsterArray;
    }

    subHP(n: number) {
        //防止死后还被攻击,执行了下面的代码    
        if (this.cHP === 0)
            return;

        this.cHP -= n;
        if (this.cHP <= 0) {
            this.cHP = 0;
            this.monsterArray.splice(this.monsterArray.indexOf(this), 1);
            this.walk.stopWalk();
            this.deadAnim();
        }
        this.updateBloodBar();
    }

    /**
     * 是否受到范围伤害
     * @param pos 爆炸点 世界坐标
     * @param radian 爆炸范围
     */
    isInjuredInScope(pos: cc.Vec2, radian: number): boolean {
        let centerP: cc.Vec2 = this.getPosInWorld();
        let w: number = this.bg.width;

        let l: number = pos.sub(centerP).mag();
        if (w + radian >= l)
            return true;
        return false;
    }

    /**
     * 脚坐标
     * @returns  
     */
    getPosInWorld() {
        let P: cc.Vec2 = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        return P;
    }

    private updateBloodBar() {
        let p: number = this.cHP / this.maxHP;
        this.bloodBar.progress = p;
    }

    private attackAnim() {
        //V
        if (this.state === State.walk)
            this.walk.pauseWalk();
        if (this.state !== State.attack) {
            let frame: cc.SpriteFrame[] = this.attackFrame;
            this.BGFrameAnim.setFrameArray(frame);
            this.state = State.attack;
        }
        this.BGFrameAnim.play(false, function () {
            this.state = State.idle;
        }.bind(this));


    }

    /**
     * 死亡
     */
    private deadAnim() {
        //V
        if (this.state === State.walk)
            this.walk.pauseWalk();
        if (this.state !== State.dead) {
            let frame: cc.SpriteFrame[] = this.deadFrame;
            this.BGFrameAnim.setFrameArray(frame);
            this.state = State.dead;
        }
        this.BGFrameAnim.play(false, false, false, function () {

            let a: cc.ActionInterval = cc.fadeOut(1.0);
            this.node.runAction(a);
        }.bind(this));

    }

    /**
     * 删除节点，并不从怪物列表中移除
     */
    destroySelf() {
        this.node.removeFromParent();
        this.node.destroy();
    }

    update(dt) {
        if (this.isFindEnemy) { //发现敌人
            if (this.state !== State.attack) { //不处于攻击状态
                if (this.state === State.walk)
                    this.walk.pauseWalk();

                this.attackAnim();

            }
        }
        else { //没有发现敌人
            if (this.state !== State.walk && this.state != State.dead) {
                this.state = State.walk;
                this.walk.continueWalk();
            }
        }
    }
}
