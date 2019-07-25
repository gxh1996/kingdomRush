/*
    游戏配置数据：
    每关玩家的  
    initChip: 2000, 初始金币
    initBlood: 20, 初始血
    skillsUpConfig:{ //技能升级所需星星
    
    }

    towersUpConfig:{ //塔升级所需星星
    
    }


    有3个玩家存档。每个存档都有：
        
        

        玩家闯关数据：
        一共有19关，每关最多可得3个星星，共57个星星。
        rushLevels: 玩家闯到了多少关
        levelsInfo: []，每关得多少分

        currentStars: 当前玩家得到多少个星星
        玩家技能等级数据：
        skillsLevel:{
            bomb: 炸弹技能
                放兵技能
        } 一共有6种技能，每种技能升到了多少级。

        玩家塔等级数据：
        towersLevel：{
            arrow: 弓箭
            barrack: 兵营
            magiclan: 术士
            artillery: 火炮
        }
*/
export class User {
    /**
     * 初始用户数据
     */
    private initUserData = {
        username: "无",
        rushLevelsSum: 0, //玩家闯过了多少关
        levelsReview: [], //每关得的分数
        currentStarSum: 0, //当前玩家一共得到多少个星星
        towersLevel: { //tower当前等级
            arrow: 0,
            barrack: 0,
            magiclan: 0,
            artillery: 0
        },
        skillsLevel: { //技能当前等级
            bomb: 0, //炸弹技能
            dispatchTroops: 0,//出兵技能
        },
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
        this.userData = this.ls.getItem("userData:" + username);
        if (this.userData === null) {
            this.userData = this.initUserData;
            this.userData.username = username;
        }
        else
            this.userData = JSON.parse(this.userData);
    }

    delUser() {
        this.ls.removeItem(this.userData.username);
    }

    getUsername(): string {
        return this.userData.username;
    }

    /**
     * 当前玩家一共得到多少个星星
     * @returns start sum 
     */
    getStartSum(): number {
        if (this.userData === null)
            return;
        return this.userData.currentStarSum;
    }

    setStartSum(n: number) {
        if (this.userData === null)
            return;
        this.userData.currentStarSum = n;
    }

    /**
     * 玩家闯过了多少关
     * @returns rush levels sum 
     */
    getRushLevelsSum(): number {
        if (this.userData === null)
            return;

        return this.userData.rushLevelsSum;
    }

    setRushLevelsSum(rushLevelsSum: number) {
        if (this.userData === null)
            return;

        this.userData.rushLevelsSum = rushLevelsSum;
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

    setLevelsReview(levelsReview: number[]) {
        if (this.userData === null)
            return;

        this.userData.levelsReview = levelsReview;
    }

    /**
     * 当前塔的等级
     * @returns rush levels sum 
     */
    getTowersLevel(): number[] {
        if (this.userData === null)
            return;

        return this.userData.towersLevel;
    }

    setTowersLevel(towersLevel: number[]) {
        if (this.userData === null)
            return;

        this.userData.towersLevel = towersLevel;
    }

    getSkillsLevel(): number[] {
        if (this.userData === null)
            return;

        return this.userData.skillsLevel;
    }

    setSkillsLevel(skillsLevel: number[]) {
        if (this.userData === null)
            return;

        this.userData.skillsLevel = skillsLevel;
    }

    preseverData() {
        this.ls.setItem("userData:" + this.userData.username, JSON.stringify(this.userData));
    }
}

export class GameConfig {
    /**
     * 初始游戏数据配置
     */
    private initGameConfig = { //配置数据
        currentUsernames: [], //当前用户
        initChip: 2000, //每关的初始金币
        initBlood: 20, //每关的初始血量
        towerUpNeedStar: { //tower升级需要的星星
            arrow: [0, 1, 1, 2, 2, 3],
            barrack: [0, 1, 1, 2, 2, 3],
            magiclan: [0, 1, 1, 2, 2, 3],
            artillery: [0, 1, 1, 2, 2, 3]
        },
        skillsUpNeedStar: { //技能升级需要的星星
            bomb: [0, 1, 1, 2, 3, 3], //炸弹技能
            dispatchTroops: [0, 1, 1, 2, 3, 4],//出兵技能
        },
        levelsSum: 19, //一共有多少关
        starSum: 57, //一共最多得到57个星星
    };
    private ls = cc.sys.localStorage;
    private gameConfig = null;

    constructor() {
        this.gameConfig = this.ls.getItem("gameConfig");
        if (this.gameConfig === null)
            this.gameConfig = this.initGameConfig;
        else
            this.gameConfig = JSON.parse(this.gameConfig);
    }

    setCurrentUsernames(usernames: string[]) {
        this.gameConfig.currentUsernames = usernames;
    }

    getCurrentUsernames(): string[] {
        return this.gameConfig.currentUsernames;
    }

    addUsername(username: string) {
        this.gameConfig.currentUsernames.push(username);
    }

    delUsername(username) {
        let usernames: string[] = this.gameConfig.currentUsernames;
        let i: number = usernames.indexOf(username);
        usernames.splice(i, 1);
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

    getSkillsUpNeedStar(): object {
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
        return this.gameConfig.starSum;
    }

    /**
     * 保存游戏配置数据
     */
    preserveData() {
        this.ls.setItem("gameConfig", JSON.stringify(this.gameConfig));
    }

}

export default class GameDataStorage {
    private static gameConfig: GameConfig = new GameConfig();
    private static users: User[] = [];
    private static currentUser = null;

    /**
     * 游戏打开时必须执行一次
     */
    static init() {
        let usernames: string[] = this.gameConfig.getCurrentUsernames();
        for (let i = 0; i < usernames.length; i++)
            this.users.push(new User(usernames[i]));
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
        this.gameConfig.addUsername(username);
    }

    static delUser(username: string) {
        this.gameConfig.delUsername(username);
        for (let i = 0; i < this.users.length; i++)
            if (this.users[i].getUsername() === username) {
                this.users[i].delUser();
                this.users.splice(i, 1);
                return;
            }
    }

    /**
     * 保存游戏数据,游戏退出时必须执行
     */
    static preserveGameData() {
        for (let v of this.users)
            v.preseverData();
        this.gameConfig.preserveData();
    }
}

