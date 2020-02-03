import GameDataStorage, { User } from "../common/module/gameDataManager";
import SoundsManager from "../common/module/soundsManager";
import SelectLevelScene from "./selectLevelScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelManager extends cc.Component {

    private levels: cc.Node[] = null;
    private isLevelButton: boolean = false;
    private selectLevelScene: SelectLevelScene = null;
    private levelEntry: cc.Node = null;
    /**
     * 最大关数
     */
    private MaxLevelNum: number = null;
    /**
     * 最新解锁的关卡
     */
    private newLevel: number;

    onLoad() {
        this.levels = this.node.children;
        this.selectLevelScene = cc.find("Canvas").getComponent("selectLevelScene");
        this.levelEntry = this.levels[this.levels.length - 1];
        this.MaxLevelNum = GameDataStorage.getGameConfig().getLevelsSum();
    }

    start() {
        this.buttonEventBind();
    }

    /**
     * 按钮事件绑定
     */
    private buttonEventBind() {
        let buttons: cc.Node[] = this.node.children;
        for (let i = 0; i < buttons.length; i++) {
            let node: cc.Node = buttons[i];
            let button: cc.Button = node.getComponent(cc.Button);
            let click_event = new cc.Component.EventHandler();

            //添加响应事件的必要参数，即响应函数所在的节点、组件、函数
            click_event.target = this.node;
            click_event.component = "levelManager";
            click_event.handler = "levelButtonFunc";
            click_event.customEventData = (i + 1).toString();
            button.clickEvents.push(click_event);
        }
    }

    levelButtonFunc(e, level) {
        if (this.isLevelButton)
            return;
        this.isLevelButton = true;
        SoundsManager.ins.playEffect("sounds/click");

        if (level > this.MaxLevelNum) { //最新关
            this.selectLevelScene.toLevelScene(this.newLevel);
            return;
        }

        this.selectLevelScene.toLevelScene(level);

    }

    /**
     * 更新选关地图
     */
    updateLevelMap(user: User) {
        let visitedN: number = user.getRushLevelsSum();
        let levelsReview: number[] = user.getLevelsReview();
        //更新已闯过的关
        for (let i = 0; i < visitedN; i++) {
            let level: cc.Node = this.levels[i];
            let stars: cc.Node[] = level.children;
            let getStarNum: number = levelsReview[i];
            for (let j = 0; j < getStarNum; j++) {
                let emptyStar: cc.Node = stars[j + 1].getChildByName("emptyStar");
                emptyStar.active = false;
            }
            level.active = true;
        }

        if (visitedN + 1 > GameDataStorage.getGameConfig().getLevelsSum())
            return;

        //更新没有闯的第一个新关
        let nextLevel: cc.Node = this.levels[visitedN];
        let pos: cc.Vec2 = nextLevel.getPosition();
        this.levelEntry.setPosition(pos);
        this.levelEntry.active = true;

        //记录下最新关入口对应的关数
        this.newLevel = visitedN + 1;

        //添加响应事件的必要参数，即响应函数所在的节点、组件、函数
        let button: cc.Button = nextLevel.getComponent(cc.Button);
        let click_event = new cc.Component.EventHandler();
        click_event.target = this.node;
        click_event.component = "levelManager";
        click_event.handler = "levelButtonFunc";
        click_event.customEventData = (visitedN + 1).toString();
        button.clickEvents.push(click_event);
    }

}
