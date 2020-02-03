import Utils from "./utils";
import StorageManager from "./storageManager";

export class User {
    /**
     * 初始用户数据
     */
    private initUserData = {
        username: "无",
        levelsReview: [], //每关得的星星
        currentHaveStarNum: 0, //当前能用的星星数
        skillsLevel: [0, 0, 0, 0, 0, 0]
        // { //当前等级
        //     arrow: 0,
        //     barrack: 0, 兵营
        //     magiclan: 0,
        //     artillery: 0,
        //     bomb: 0, //炸弹技能
        //     dispatchTroops: 0,//出兵技能
        // },
    }
    /**
     * 用户数据
     */
    private userData = null;
    private ls = cc.sys.localStorage;

    /**
     * 没有该用户会 初始化该用户出来
     * @param username 
     */
    constructor(username: string) {
        this.userData = StorageManager.ins.getData("userData:" + username);
        if (this.userData === null) {
            this.userData = this.initUserData;
            this.userData.username = username;
        }
        else
            this.userData = JSON.parse(this.userData);
    }

    getUsername(): string {
        return this.userData.username;
    }

    /**
     * 重置技能，归回星星
     */
    resetSkill() {
        this.userData.skillsLevel.fill(0);
        this.userData.currentHaveStarNum = this.getStarSum();
    }

    /**
     * 拥有的星星数
     */
    getCurrentHaveStarNum(): number {
        return this.userData.currentHaveStarNum;
    }

    /**
     * 减去拥有的星星
     * @param n 星星数
     */
    subHavedStar(n: number) {
        this.userData.currentHaveStarNum -= n;
    }

    private addHavedStar(n: number) {
        this.userData.currentHaveStarNum += n;
    }

    /**
     * 当前玩家一共得到多少个星星
     * @returns start sum 
     */
    getStarSum(): number {
        if (this.userData === null)
            return;
        let s: number = 0;
        for (let i = 0; i < this.userData.levelsReview.length; i++)
            s += this.userData.levelsReview[i];
        return s;
    }

    /**
     * 玩家闯过了多少关
     * @returns rush levels sum 
     */
    getRushLevelsSum(): number {
        if (this.userData === null)
            return;

        return this.userData.levelsReview.length;
    }

    /**
     * 每关得到的分数
     * @returns rush levels sum 
     */
    getLevelsReview(): number[] {
        if (this.userData === null)
            return;

        return this.userData.levelsReview;
    }

    /**
     * Sets level review
     * @param levelN 第几关，0开始
     * @param review 得到的星星数
     */
    setLevelReview(levelN: number, review: number) {
        if (levelN > this.userData.rushLevelsSum)
            this.userData.rushLevelsSum = levelN;
        else {
            if (this.userData.levelsReview[levelN] === undefined) {
                this.userData.levelsReview[levelN] = review;
                this.addHavedStar(review);
            }
            else if (this.userData.levelsReview[levelN] < review) {
                let add: number = review - this.userData.levelsReview[levelN];
                this.userData.levelsReview[levelN] = review;
                this.addHavedStar(add);
            }
            this.preseverData();
        }
    }

    /**
     * 当前技能的等级,0开始
     * @returns rush levels sum 
     */
    getSkillsLevel(): number[] {
        if (this.userData === null)
            return;

        return this.userData.skillsLevel;
    }

    preseverData() {
        StorageManager.ins.storageData("userData:" + this.userData.username, JSON.stringify(this.userData))
        console.log("保存用户数据:", this.userData);
    }
}

export class GameConfig {
    private gameConfig = null;

    constructor(gameConfig: any) {
        this.gameConfig = gameConfig;
        console.log("新建一个GameConfig对象，显示json对象:\n", this.gameConfig);

    }

    getRateOfSale(): number {
        return this.gameConfig.rateOfSale;
    }

    getInitChip(): number {
        return this.gameConfig.initChip;
    }

    getInitBlood(): number {
        return this.gameConfig.initBlood;
    }

    getTowerUpNeedStar(): object {
        return this.gameConfig.towerUpNeedStar;
    }

    getSkillsUpNeedStar(): number[][] {
        return this.gameConfig.skillsUpNeedStar;
    }

    /**
     * 得到 一共有多少关
     * @returns levels sum 
     */
    getLevelsSum(): number {
        return this.gameConfig.levelsSum;
    }

    /**
     * 得到 最多可得到多少星星
     * @returns start sum 
     */
    getStarSum(): number {
        return this.gameConfig.levelsSum * 3;
    }

    /**
     * 得到士兵数据
     * @returns  
     */
    getSoldierData() {
        return this.gameConfig.soldierData;
    }

    getMonsterData(): any[] {
        return this.gameConfig.mosterData;
    }

    getDataOfArrowTower(): any[] {
        return this.gameConfig.dataOfTower.arrowTower;
    }
    getDataOfArtillery(): any[] {
        return this.gameConfig.dataOfTower.artillery;
    }
    getDataOfBarrack(): any[] {
        return this.gameConfig.dataOfTower.barrack;
    }
    getDataOfMagiclan(): any[] {
        return this.gameConfig.dataOfTower.magiclan;
    }

}

export default class GameDataStorage {
    private static gameConfig: GameConfig = null;
    private static users: User[] = [];
    private static usernames: string[] = null;
    private static currentUser: User = null;
    private static ls = cc.sys.localStorage;

    /**
     * 游戏打开时必须执行一次
     * @param gameConfig json对象
     */
    static init(gameConfig: any) {
        this.gameConfig = new GameConfig(gameConfig);
        this.usernames = this.getNamesOfAllUser();
        for (let i = 0; i < this.usernames.length; i++)
            this.users.push(new User(this.usernames[i]));
    }

    private static getNamesOfAllUser(): string[] {
        let r = StorageManager.ins.getData("namesOfAllUser");
        if (r === null)
            return [];
        else
            return JSON.parse(r);

    }

    /**
     * 保存所有用户的名字
     */
    private static preserveNamesOfAllUser() {
        if (this.usernames.length > 0) {
            let json: string = JSON.stringify(this.usernames);
            StorageManager.ins.storageData("namesOfAllUser", json);
            console.log("所有用户名保存成功!");
        }
    }

    static getGameConfig() {
        return this.gameConfig;
    }

    /**
     * 获得当前使用的用户
     * @returns current user 
     */
    static getCurrentUser(): User {
        return this.currentUser;
    }

    static setCurrentUser(user: User) {
        this.currentUser = user;
    }

    /**
     * 得到所有用户的信息
     * @returns users 
     */
    static getUsers(): User[] {
        return this.users;
    }

    /**
     * 新建一个用户
     * @param username 
     */
    static createUser(username: string) {
        let newUser: User = new User(username);
        this.users.push(newUser);
        this.usernames.push(username);
        this.preserveNamesOfAllUser();
        newUser.preseverData();
    }

    static delUser(username: string) {
        //从所有用户名中移除
        Utils.remvoeItemOfArray(this.usernames, username);
        //从用户数组中移除
        for (let i = 0; i < this.users.length; i++)
            if (this.users[i].getUsername() === username) {
                this.users.splice(i, 1);
                break;
            }
        //从本地存储数据中删除
        StorageManager.ins.removeData("userData:" + username);
        this.preserveNamesOfAllUser();
    }

    /**
     * 保存游戏数据,游戏退出时必须执行
     */
    static preserveGameData() {
        for (let v of this.users)
            v.preseverData();
        this.preserveNamesOfAllUser();
    }
}

