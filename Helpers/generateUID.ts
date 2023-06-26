import { customAlphabet, nanoid } from 'nanoid';
import {numbers} from 'nanoid-dictionary';

export function generateResidentssUID() {
    const generate8UniqueNumbers = customAlphabet(numbers, 8);

    const uniqueId = `SC${generate8UniqueNumbers()}`
    return uniqueId;
}

export function generateUID() {
    return nanoid(15);
}


