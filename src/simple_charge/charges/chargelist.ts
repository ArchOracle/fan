import {AgentList} from "../../libs/ts/map/agentList";
import {Source} from "./source";
import {Corpuscle} from "./corpuscule";
import {Field} from "./field";
import {Pixel} from "../../libs/ts/image/pixel";
import {State} from "../../libs/ts/map/state";
import {Charge} from "./charge";

export class ChargeList extends AgentList{
    #source?: Source
    #corpuscle?: Corpuscle
    #field?: Field
    #fieldCharge: number = 0
    #fieldEnergy: number = 0

    constructor(x: number, y: number) {
        super(x, y);
    }

    evaluate(storage: State, state: State) {
        if (this.getSource().getCharge() !== 0) {
            this.getSource().evaluate(storage, state)
        }
        if (this.getCorpuscle().getCharge() !== 0) {
            this.getCorpuscle().evaluate(storage, state)
        }
        if (this.getFieldCharge() !== 0) {
            this.getField().evaluate(storage, state)
        }
    }

    push(agent: Charge) {
        if (agent instanceof Source) {
            this.getSource().setCharge(this.getSource().getCharge() + agent.getCharge())
            this.getSource().setCount(this.getSource().getCount() + agent.getCount())
        }
        if (agent instanceof Corpuscle) {
            const otherCharge = agent.getCharge()
            const otherCount = agent.getCount()

            let newCount = this.getCorpuscle().getCharge() * this.getCorpuscle().getCount() + otherCharge * otherCount

            this.getCorpuscle().setCharge(Math.sign(newCount))
            this.getCorpuscle().setCount(Math.abs(newCount))
        }
        if (agent instanceof Field) {
            const charge = this.getFieldCharge() + agent.getCharge()
            this.getField().setCharge(charge)
            this.#fieldCharge = charge
        }
        return this
    }

    getSource(): Source {
        if (!this.#source) {
            this.#source = new Source(this.x, this.y, 0, {
                    charge: 0,
                    count: 0,
                    x: this.x,
                    y: this.y
                })
        }
        return <Source>this.#source
    }

    getCorpuscle(): Corpuscle {
        if (!this.#corpuscle) {
            this.#corpuscle = new Corpuscle(this.x, this.y, 0, {
                charge: 0,
                count: 0,
                x: this.x,
                y: this.y
            })
        }
        return <Corpuscle>this.#corpuscle
    }

    getField(): Field {
        if (!this.#field) {
            this.#field = new Field(this.x, this.y, 0, {
                charge: 0,
                count: 0,
                x: this.x,
                y: this.y
            })
        }
        return <Field>this.#field
    }

    getFieldCharge() {
        return this.#fieldCharge
    }

    getFieldEnergy() {
        return this.#fieldEnergy
    }

    setSource(source: Source) {
        this.#source = source
        return this
    }

    setCorpuscle(corpuscle: Corpuscle) {
        this.#corpuscle = corpuscle
        return this
    }

    setField(field: Field) {
        this.#field = field
        this.#fieldCharge = field.getCharge()
        this.#fieldEnergy = field.getEnergy()
        return this
    }

    saveField() {
        this.#fieldCharge = this.#field!.getCharge()
        this.#fieldEnergy = this.#field!.getEnergy()
        return this
    }

    save(state: State) {
        if (
            this.getSource().getCharge() !== 0 ||
            this.getCorpuscle().getCharge() !== 0 ||
            this.getFieldCharge() !== 0
        ) {
            state.set(this.getX(), this.getY(), this)
        }
        return this
    }

    getCountExistsAgent(): number {
        return (this.getSource().getCharge() !== 0 ? 1 : 0) +
            (this.getCorpuscle().getCharge() !== 0 ? 1 : 0) +
            (this.getFieldCharge() !== 0 ? 1 : 0)
    }

    getPixel(): Pixel {
        let pixel = new Pixel(255, 0, 0, 0)
        const corpuscle = this.getCorpuscle() instanceof Corpuscle && this.getCorpuscle().getCharge() !== 0
        const field = this.getField() instanceof Field && this.getField().getCharge() !== 0
        if (corpuscle) {
            const charge = this.getCorpuscle().getCharge()
            pixel.setRed(255 * charge).setGreen(-255 * charge)

            if (this.getCorpuscle().getCount() > 1) {
                pixel.setBlue(255)
            }
        }
        if (field) {
            if (!corpuscle) {
                pixel.setBlue(Math.min(Math.floor(this.getField().getEnergy() * 100), 100))
                if (this.getFieldCharge() > 0) {
                    pixel.setRed(pixel.getBlue())
                } else {
                    pixel.setGreen(pixel.getBlue())
                }
            }
        }
        if (this.getSource() instanceof Source && this.getSource().getCharge() !== 0) {
            pixel.setRed(155).setGreen(155).setBlue(155)
        }
        return pixel
    }

}