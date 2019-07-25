import { User } from "../common/module/gameDataManager";
import SoundsManager from "../common/module/soundsManager";
import SelectLevelScene from "./selectLevelScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelManager extends cc.Component {

    @property({ type: cc.Prefab })
    private levelEntryPrefab: cc.Prefab = null;

    private levels: cc.Node[] = null;
    private isLevelButton: boolean = false;
    private soundsManager: SoundsManager = null;
    private selectLevelScene: SelectLevelScene = null;
    onLoad() {
        this.levels = this.node.children;
        this.soundsManager = new SoundsManager();
        this.selectLevelScene = cc.find("Canvas").getComponent("selectLevelScene");
    }

    start() {
        // console.log(this.levels);
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

        this.soundsManager.playEffect("sounds/click");
        this.selectLevelScene.toLevelScene();

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
                stars[j + 1].active = true;
            }
            level.active = true;
        }
        //更新没有闯的第一个新关
        let nextLevel: cc.Node = this.levels[visitedN];
        let pos: cc.Vec2 = nextLevel.getPosition();
        let Entry: cc.Node = cc.instantiate(this.levelEntryPrefab);
        this.node.addChild(Entry);
        Entry.setPosition(pos);
    }

}
