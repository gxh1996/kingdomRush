import GameDataStorage, { User } from "../common/module/gameDataManager";
import SelectLevelScene from "./selectLevelScene";
import AseriesSkill from "./aSeriesSkill";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillsBoard extends cc.Component {

    @property({ type: cc.Label })
    private starNum: cc.Label = null;

    @property({
        type: AseriesSkill,
        tooltip: "5个技能"
    })
    private aSeriesSkillArray: AseriesSkill[] = [];

    private user: User = null;
    private selectLevelScene: SelectLevelScene = null;
    private animation: cc.Animation = null;
    onLoad() {
        this.user = GameDataStorage.getCurrentUser();
        this.selectLevelScene = cc.find("Canvas").getComponent("selectLevelScene");
        this.animation = this.node.getComponent(cc.Animation);
    }

    start() {
        this.updateStarNum();

    }

    /**
     * 更新技能板上显示的星星数
     */
    updateStarNum() {
        this.starNum.string = this.user.getCurrentHaveStarNum().toString();
    }

    skillBoardBack() {
        this.animation.play("skillsBoardUp");
    }

    /**
     * 重置技能
     */
    resetSkills() {
        //更新数据
        this.user.resetSkill();
        //更新显示的星星数
        this.updateStarNum();
        this.selectLevelScene.updateScoreLabel();
        //更新技能树
        for (let aSeriesSkill of this.aSeriesSkillArray)
            aSeriesSkill.updateSkillIcons();
    }
    // update (dt) {}
}
