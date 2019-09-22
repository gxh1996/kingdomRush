const { ccclass, property } = cc._decorator;

@ccclass
export default class StarReview extends cc.Component {

    @property({
        type: [cc.Node]
    })
    private stars: cc.Node[] = [];

    setReview(g: number) {
        for (let i = 0; i < g; i++)
            this.stars[i].active = true;
    }
}
