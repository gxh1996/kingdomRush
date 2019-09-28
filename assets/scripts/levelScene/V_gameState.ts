const { ccclass, property } = cc._decorator;

@ccclass
export default class V_gameState extends cc.Component {

    @property({ type: cc.Label })
    private hp: cc.Label = null;

    @property({ type: cc.Label })
    private gold: cc.Label = null;

    @property({ type: cc.Label })
    private round: cc.Label = null;

    setHP(hp: number) {
        this.hp.string = hp.toString();
    }

    setGold(g: number) {
        this.gold.string = g.toString();
    }

    setRound(curR: number, maxR: number) {
        this.round.string = `${curR}/${maxR}`;
    }
}
