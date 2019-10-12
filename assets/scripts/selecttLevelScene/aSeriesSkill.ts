import GameDataStorage, { GameConfig, User } from "../common/module/gameDataManager";
import SelectLevelScene from "./selectLevelScene";
import SkillsBoard from "./skillsBoard";

const { ccclass, property } = cc._decorator;

/**
 * 技能图标有3个状态：可以升级并且星星够、可以升级但星星不够、不能升级的灰色、已升级
 */
export enum SkillState { Upgradable, StarShort, Upgraded, UnUpgrade };

export class SkillIcon {
    private state: SkillState;
    private node: cc.Node;
    /**
     * bg节点下的cc.Button
     */
    private button: cc.Button;
    private starNum: cc.Node;
    private label: cc.Label;
    private labelNode: cc.Node;

    /**
     * Creates an instance of skill icon.
     * @param node 图标节点
     * @param state 该技能状态
     */
    constructor(node: cc.Node, state: SkillState, upNeedStarNum: number) {
        this.node = node;
        this.button = node.getChildByName("bg").getComponent(cc.Button);
        this.starNum = node.getChildByName("starNum");
        this.labelNode = this.starNum.getChildByName("label");
        this.label = this.labelNode.getComponent(cc.Label);

        this.setState(state);
        this.setNeedStarNum(upNeedStarNum);
    }

    setState(state: SkillState) {
        this.state = state;
        switch (this.state) {
            case SkillState.Upgradable: { //可以升级
                this.button.interactable = true;
                this.starNum.active = true;
                this.labelNode.color = cc.Color.WHITE;
                break;
            }
            case SkillState.StarShort: {
                this.button.interactable = true;
                this.starNum.active = true;
                this.labelNode.color = cc.Color.RED;
                break;
            }
            case SkillState.UnUpgrade: { //不能升级
                this.button.interactable = false;
                this.starNum.active = true;
                this.labelNode.color = cc.Color.WHITE;
                break;
            }
            case SkillState.Upgraded: { //已升级
                this.button.interactable = true;
                this.starNum.active = false;
                this.labelNode.color = cc.Color.WHITE;
                break;
            }
        }
    }

    getState(): SkillState {
        return this.state;
    }

    getButton(): cc.Button {
        return this.button;
    }


    private setNeedStarNum(n: number) {
        this.label.string = n.toString();
    }

}

@ccclass
export default class AseriesSkill extends cc.Component {

    @property({ tooltip: "这个是第几个技能，从1开始" })
    private skillNum: number = 1;
    /**
     * 每个技能有 5个 等级，即有5个Node
     */
    private skillNode: cc.Node[] = null;
    private skillIcons: SkillIcon[] = [];
    private gameConfig: GameConfig = null;
    private user: User = null;
    /**
     * 当前玩家技能的等级
     */
    private skillLevel: number[] = null;
    private selectLevelScene: SelectLevelScene = null;
    private skillsUpNeedStar: number[][];
    private skillsBoard: SkillsBoard = null;
    onLoad() {
        this.gameConfig = GameDataStorage.getGameConfig();
        this.user = GameDataStorage.getCurrentUser();
        this.skillLevel = this.user.getSkillsLevel();
        this.skillNode = this.node.children;
        this.selectLevelScene = cc.find("Canvas").getComponent("selectLevelScene");
        this.skillsUpNeedStar = this.gameConfig.getSkillsUpNeedStar();
        this.skillsBoard = cc.find("Canvas/centerAnchor/skillsBoard").getComponent("skillsBoard");
    }

    start() {

        this.initskillIcons();

    }

    private initskillIcons() {
        for (let i = 0; i < 5; i++) { //技能等级
            let skillIcon: SkillIcon = new SkillIcon(this.skillNode[i], this.judgeSkillState(i + 1), this.skillsUpNeedStar[this.skillNum - 1][i]);
            this.skillIcons.push(skillIcon);

            //绑定按钮事件
            let button: cc.Button = skillIcon.getButton();
            let click_event = new cc.Component.EventHandler();

            //添加响应事件的必要参数，即响应函数所在的节点、组件、函数
            click_event.target = this.node;
            click_event.component = "aSeriesSkill";
            click_event.handler = "upSkill";
            click_event.customEventData = i.toString();
            button.clickEvents.push(click_event);
        }
    }

    /**
     * 更新技能树显示
     */
    updateSkillIcons() {
        for (let i: number = 0; i < this.skillIcons.length; i++) {
            this.skillIcons[i].setState(this.judgeSkillState(i + 1));
        }
    }

    /**
     * 升级技能等级
     * @param levelNum 该技能升级到几级。1开始
     */
    upSkill(e, levelNum) {
        levelNum = Number(levelNum);
        if (levelNum <= this.skillLevel[this.skillNum - 1]) //该技能已升级
            return;
        let needStarN: number = this.skillsUpNeedStar[this.skillNum - 1][levelNum - 1];
        let haveStarN: number = this.user.getCurrentHaveStarNum();
        if (needStarN > haveStarN) //星星不够
            return;

        //更新内部数据
        this.user.subHavedStar(needStarN);
        this.skillLevel[this.skillNum - 1] = levelNum;
        //更新技能树显示
        this.skillIcons[levelNum - 1].setState(SkillState.Upgraded);
        this.skillIcons[levelNum].setState(this.judgeSkillState(levelNum + 1));
        //更新显示的星星数
        this.selectLevelScene.updateScoreLabel();
        //更新技能板上显示的星星数
        this.skillsBoard.updateStarNum();
    }

    /**
     * Judges skill state
     * @param iconNum 一个技能的第几个等级,1开始
     * @returns skill state 
     */
    private judgeSkillState(iconNum: number): SkillState {
        if (iconNum <= this.skillLevel[this.skillNum - 1]) //已升级
            return SkillState.Upgraded;
        if (iconNum === this.skillLevel[this.skillNum - 1] + 1) { //能升级
            let need: number = this.skillsUpNeedStar[this.skillNum - 1][iconNum - 1];
            let have: number = this.user.getCurrentHaveStarNum();
            if (have >= need)//星星够
                return SkillState.Upgradable;
            else //星星不够
                return SkillState.StarShort;
        }

        return SkillState.UnUpgrade; //不能升级
    }


}
