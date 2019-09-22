export default class Utils {


    /**
     * Gets random number
     * @param min 
     * @param max 
     * @returns [min, max]: Interger 
     */
    static getRandomInterger(min: number, max: number): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

}