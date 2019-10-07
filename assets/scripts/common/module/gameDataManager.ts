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
     * 重置技能
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

    addHavedStar(n: number) {
        this.userData.currentHaveStarNum += n;
        this.userData.currentStarSum += n;
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
        if (this.userData.levelsReview[levelN] === undefined || this.userData.levelsReview[levelN] < review)
            this.userData.levelsReview[levelN] = review;
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
        this.ls.setItem("userData:" + this.userData.username, JSON.stringify(this.userData));
    }
}

export class GameConfig {
    /**
     * 初始游戏数据配置
     */
    // private initGameConfig = { //配置数据
    //     currentUsernames: [], //存在的用户
    //     initChip: 200, //每关的初始金币
    //     initBlood: 4, //每关的初始血量
    //     skillsUpNeedStar: [
    //         [1, 1, 2, 2, 3],
    //         [1, 1, 2, 2, 3],
    //         [1, 1, 2, 2, 3],
    //         [1, 1, 2, 2, 3],
    //         [1, 1, 2, 3, 3],
    //         [1, 1, 2, 3, 4]
    //     ],
    //     // { //tower升级需要的星星
    //     //     arrow: [0, 1, 1, 2, 2, 3],
    //     //     barrack: [0, 1, 1, 2, 2, 3],
    //     //     magiclan: [0, 1, 1, 2, 2, 3],
    //     //     artillery: [0, 1, 1, 2, 2, 3],
    //     //     bomb: [0, 1, 1, 2, 3, 3], //炸弹技能
    //     //     dispatchTroops: [0, 1, 1, 2, 3, 4],//出兵技能
    //     // },
    //     levelsSum: 19, //一共有多少关
    //     starSum: 57, //一共最多得到57个星星
    //     towerAttack: [
    //         [8, 10, 14, 18, 22], //arrowTower 
    //         [6, 8, 10, 15, 16], //artilleryTower
    //     ],
    //     soldierData: [
    //         {
    //             HP: 30,
    //             speedOfMove: 50,
    //             intervalOfAttack: 1,
    //             aggressivity: 5,
    //             rangeOfAttack: 15,
    //             rangeOfInvestigate: 80,
    //             intervalOfThink: 1
    //         },
    //         {
    //             HP: 30,
    //             speedOfMove: 50,
    //             intervalOfAttack: 1,
    //             aggressivity: 5,
    //             rangeOfAttack: 15,
    //             rangeOfInvestigate: 80,
    //             intervalOfThink: 1
    //         },
    //         {
    //             HP: 30,
    //             speedOfMove: 50,
    //             intervalOfAttack: 1,
    //             aggressivity: 5,
    //             rangeOfAttack: 15,
    //             rangeOfInvestigate: 80,
    //             intervalOfThink: 1
    //         },
    //         {
    //             HP: 30,
    //             speedOfMove: 50,
    //             intervalOfAttack: 1,
    //             aggressivity: 5,
    //             rangeOfAttack: 15,
    //             rangeOfInvestigate: 80,
    //             intervalOfThink: 1
    //         },

    //     ],
    //     mosterData: [
    //         {
    //             HP: 30,
    //             speedOfMove: 30,
    //             intervalOfAttack: 1,
    //             aggressivity: 10,
    //             rangeOfAttack: 15,
    //             rangeOfInvestigate: 50,
    //             intervalOfThink: 1
    //         },
    //     ]
    // };
    // private ls = cc.sys.localStorage;
    private gameConfig = null;
    constructor() {

    }

    // constructor() {

    //     this.gameConfig = this.ls.getItem("gameConfig");
    //     if (this.gameConfig === null)
    //         this.gameConfig = this.initGameConfig;
    //     else
    //         this.gameConfig = JSON.parse(this.gameConfig);
    // }

    setCurrentUsernames(usernames: string[]) {
        this.gameConfig.currentUsernames = usernames;
    }

    /**
     * 得到当前所有的用户的名字
     * @returns current usernames 
     */
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
        return this.gameConfig.starSum;
    }

    /**
     * 得到士兵数据
     * @returns  
     */
    getSoldierData() {
        return this.gameConfig.soldierData;
    }

    getMonsterData() {
        return this.gameConfig.mosterData;
    }

    getTowerAttackArray() {
        return this.gameConfig.towerAttack;
    }

}

export default class GameDataStorage {
    private static gameConfig: GameConfig;
    private static users: User[] = [];
    private static currentUser: User = null;

    /**
     * 游戏打开时必须执行一次
     */
    static init() {
        this.gameConfig = new GameConfig();
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
        // this.gameConfig.preserveData();
    }
}

