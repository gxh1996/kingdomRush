import GameDataStorage, { User, GameConfig } from "../common/module/gameDataManager";
import HomeScene from "./homeScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Store extends cc.Component {

    //三个存档节点
    @property({ type: cc.Node })
    private storeNode: cc.Node[] = [];

    @property({ type: cc.Node })
    private inputBox: cc.Node = null;

    @property({ type: cc.Label })
    private inputLabel: cc.Label = null;

    private gameConfig: GameConfig = null;
    private users: User[] = null;

    private clickStoreButton: boolean = false;
    private homeScene: HomeScene = null;
    onLoad() {
        this.homeScene = cc.find("Canvas").getComponent("homeScene");
    }

    start() {
        this.users = GameDataStorage.getUsers();
        this.gameConfig = GameDataStorage.getGameConfig();
        this.updateStoreBoard();
    }

    /**
     * 更新存档面板
     */
    private updateStoreBoard() {
        for (let i = 0; i < 3; i++) {
            if (this.users[i] === undefined)
                this.updateStore(this.storeNode[i], null);
            else
                this.updateStore(this.storeNode[i], this.users[i])
        }
    }

    /**
     * 更新存档节点
     * @param storeNode 存档节点 
     * @param user 用户数据，为null表示此存档为空
     */
    private updateStore(storeNode: cc.Node, user: User) {
        let nameLabel: cc.Label = storeNode.getChildByName("nameLabel").getComponent(cc.Label);
        let startNum: cc.Label = storeNode.getChildByName("startNum").getComponent(cc.Label);

        if (user === null) {
            nameLabel.string = "无";
            startNum.string = `0/${this.gameConfig.getStarSum()}`;
            return;
        }

        nameLabel.string = user.getUsername();
        startNum.string = `${user.getStarSum()}/${this.gameConfig.getStarSum()}`;
    }

    /**
     * 点击存档
     * @param storeNum 存档几,1开始
     */
    storeButton(e, storeNum: string) {
        if (this.clickStoreButton)
            return;
        this.clickStoreButton = true;
        let i: number = parseInt(storeNum);
        if (this.users.length < i) { //没有存档，弹出输入框新建
            this.inputBox.active = true;
            this.clickStoreButton = false;
            return;
        }
        //有存档,跳转场景，将users下标传入
        this.homeScene.selectLevelScene(i - 1);
    }

    /**
     * 输入用户名确定
     */
    inputDetermine() {
        this.inputBox.active = false;
        if (this.inputLabel.string === "")
            return;
        GameDataStorage.createUser(this.inputLabel.string);
        this.updateStoreBoard();
    }

    /**
     * 输入用户名取消
     */
    cancelButton() {
        this.inputBox.active = false;
    }


    /**
     * 删除存档
     * @param storeNum 存档几
     */
    deleteStore(e, storeNum: string) {
        let i: number = parseInt(storeNum);
        if (this.users.length < i)  //存档为空
            return;
        let name: string = this.users[i - 1].getUsername();
        GameDataStorage.delUser(name);
        this.updateStoreBoard();

        console.log("删除存档", name);
    }



}
