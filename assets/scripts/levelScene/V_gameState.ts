const { ccclass, property } = cc._decorator;

@ccclass
export default class V_gameState extends cc.Component {

    @property({ type: cc.Label })
    private round: cc.Label = null;

    private HP: cc.Label = null;
    private gold: cc.Label = null;

    onLoad() {
        this.HP = this.node.getChildByName("HP").getComponent(cc.Label);
        this.gold = this.node.getChildByName("gold").getComponent(cc.Label);
    }

    setHP(HP: number) {
        this.HP.string = HP.toString();
    }

    setGold(gold: number) {
        this.gold.string = gold.toString();
    }

    /**
     * Sets round
     * @param cRound 当前回合 
     * @param maxRound 最大回合
     */
    setRound(cRound: number, maxRound: number) {
        this.round.string = "round: " + cRound + "/" + maxRound;
    }
    // update (dt) {}
}
