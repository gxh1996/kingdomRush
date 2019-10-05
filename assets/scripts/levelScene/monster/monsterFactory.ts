import Monster from "./monster";
import AnimationPath from "../../common/animationPath";
import Utils from "../../common/module/utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterFactory extends cc.Component {

    @property({ type: [cc.Prefab] })
    private monsterPrefab: cc.Prefab[] = [];

    @property({ type: AnimationPath })
    private animationPath: AnimationPath = null;

    /**
     * 待生成的怪物列表
     */
    creMonList: number[] = [];
    private cT: number = 0;
    /**
     * [怪物编号][]
     * 每次删除monster是将其回收到对象池中
     */
    private poolOfMonster: cc.NodePool[] = null;

    onLoad() {
        //初始化怪物对象池
        this.poolOfMonster = [];
        for (let i = 0; i < this.monsterPrefab.length; i++) {
            this.poolOfMonster[i] = new cc.NodePool();
        }
    }

    init() {
    }

    createMonster(num: number) {
        this.creMonList.push(num);
    }

    clearMonsters() {
        while (Monster.monstersOfAlive.length > 0)
            Monster.monstersOfAlive[0].destroySelf();
    }

    destroyMonster(m: Monster) {
        this.poolOfMonster[m.monsterNo].put(m.node);
    }

    private _createMonster(num: number) {
        let m: cc.Node;
        if (this.poolOfMonster[num].size() > 0) {
            m = this.poolOfMonster[num].get();
            m.opacity = 255;
        }
        else
            m = cc.instantiate(this.monsterPrefab[num]);

        let mScr: Monster = m.getComponent("monster");
        Monster.monstersOfAlive.push(mScr);
        this.node.addChild(m);

        mScr.init(num, this.animationPath.getWorldPath("road" + this.getRandomNumber(1, 3).toString()))
    }

    private getRandomNumber(min, max): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    update(dt) {
        if (this.creMonList.length > 0) {
            this.cT += dt;
            if (this.cT > 1) {
                this.cT = 0;
                this._createMonster(this.creMonList.shift());
            }

        }
    }
}
