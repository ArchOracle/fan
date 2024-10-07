import {AgentList} from "../../libs/ts/map/agentList";
import {Source} from "./source";
import {Corpuscle} from "./corpuscule";
import {Field} from "./field";
import {Pixel} from "../../libs/ts/image/pixel";
import {State} from "../../libs/ts/map/state";
import {Charge} from "./charge";

export class ChargeList extends AgentList{
    #source?: Source
    #sourceCharge: number = 0
    #sourceCount: number = 0
    #corpuscle?: Corpuscle
    #corpuscleCharge: number = 0
    #corpuscleCount: number = 0
    #field?: Field
    #fieldCharge: number = 0
    #fieldEnergy: number = 0

    private isExistSource: boolean = false
    private isExistCorpuscle: boolean = false
    private isExistField: boolean = false

    constructor(x: number, y: number) {
        super(x, y);
    }

    evaluate(storage: State, state: State) {
        if (this.isExistSource) {
            this.getSource().evaluate(storage, state)
        }
        if (this.isExistCorpuscle) {
            this.getCorpuscle().evaluate(storage, state)
        }
        if (this.isExistField) {
            this.getField().evaluate(storage, state)
        }
    }

    push(agent: Charge) {
        if (agent instanceof Source) {
            const charge = this.getSourceCharge() + agent.getCharge()
            const count = this.getSourceCount() + agent.getCount()
            this.getSource().setCharge(charge)
            this.getSource().setCount(count)
            this.isExistSource = charge !== 0
            this.#sourceCharge = charge
            this.#sourceCount = count
        }
        if (agent instanceof Corpuscle) {
            const otherCharge = agent.getCharge()
            const otherCount = agent.getCount()

            let newCount = this.getCorpuscleCharge() * this.getCorpuscleCount() + otherCharge * otherCount
            const charge = Math.sign(newCount)
            const count = Math.abs(newCount)
            this.getCorpuscle().setCharge(charge)
            this.getCorpuscle().setCount(count)

            this.isExistCorpuscle = charge !== 0
            this.#corpuscleCharge = charge
            this.#corpuscleCount = count
        }
        if (agent instanceof Field) {
            const charge = this.getFieldCharge() + agent.getCharge()
            this.getField().setCharge(charge)
            this.#fieldCharge = charge
            this.isExistField = charge !== 0
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

    getSourceCharge() {
        return this.#sourceCharge
    }

    getSourceCount() {
        return this.#sourceCount
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

    getCorpuscleCharge() {
        return this.#corpuscleCharge
    }

    getCorpuscleCount() {
        return this.#corpuscleCount
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

    saveSource() {
        this.#sourceCharge = this.#source!.getCharge()
        this.#sourceCount = this.#source!.getCount()
        this.isExistSource = this.#sourceCharge !== 0
        return this
    }

    setCorpuscle(corpuscle: Corpuscle) {
        this.#corpuscle = corpuscle
        return this
    }

    saveCorpuscle() {
        this.#corpuscleCharge = this.#corpuscle!.getCharge()
        this.#corpuscleCount = this.#corpuscle!.getCount()
        this.isExistCorpuscle = this.#corpuscleCharge !== 0
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
        this.isExistField = this.#fieldCharge !== 0
        return this
    }

    save(state: State) {
        if (
            this.isExistSource ||
            this.isExistCorpuscle ||
            this.isExistField
        ) {
            state.set(this.getX(), this.getY(), this)
        }
        return this
    }

    getCountExistsAgent(): number {
        return <number><unknown>(this.isExistSource) +
            <number><unknown>(this.isExistCorpuscle) +
            <number><unknown>(this.isExistField)
    }

    getPixel(): Pixel {
        let pixel = new Pixel(255, 0, 0, 0)
        const corpuscle = this.isExistCorpuscle
        const field = this.isExistField
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
        if (this.isExistSource) {
            pixel.setRed(155).setGreen(155).setBlue(155)
        }
        return pixel
    }

}