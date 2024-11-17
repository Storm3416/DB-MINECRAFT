/*
    +---------------------------------------------------+
    | ___ __ __   ______   ______    ______   _________ |
    |/__//_//_/\ /_____/\ /_____/\  /_____/\ /________/\|
    |\::\| \| \ \\:::_ \ \\:::_ \ \ \::::_\/_\__.::.__\/|
    | \:.      \ \\:\ \ \ \\:(_) ) )_\:\/___/\  \::\ \  |
    |  \:.\-/\  \ \\:\ \ \ \\: __ \ \ \_::._\:\  \::\ \ |
    |   \. \  \  \ \\:\_\ \ \\ \ \ \ /  ____\: \  \::\ \|
    |    \__\/ \__\/ \_____\/ \_\/ \_\/ \_______\  \__\/|
    +---------------------------------------------------+
                        By Storm3416
*/

import { world, system } from "@minecraft/server";
let properties = []

export class Database {
    constructor(name) {
        this.name = name;
        const getDatabases = world.getDynamicPropertyIds()
        if (getDatabases) {
            getDatabases.forEach(p => {
                const split = p.split(":")
                if (split[0] === this.name) {
                    if (!properties[this.name]) {
                        properties[this.name] = {
                            properties: [p]
                        }
                    } else {
                        properties[this.name].properties.push(p)
                    }
                }
            })
        }

        if (!properties[this.name]) {
            properties[this.name] = {
                properties: []
            }
        }

        if (!properties[this.name].properties) {
            properties[this.name] = {
                properties: []
            }
        }

    }
    // property => string | number | boolean | Vector3
    // value => string
    set(property, value) {
        world.setDynamicProperty(this.name + ":" + property, JSON.stringify(value))
        if (properties[this.name].properties.find((c) => c.split(":")[1] == property)) return // console.warn(JSON.stringify(properties[this.name].properties))
        properties[this.name].properties.push(this.name + ":" + property)
        // console.warn(JSON.stringify(properties[this.name].properties))
    }
    // get => string
    get(property) {
        if (world.getDynamicProperty(this.name + ":" + property) === undefined) return undefined
        return JSON.parse(world.getDynamicProperty(this.name + ":" + property))
    }
    // delete => string
    delete(property) {
        if (properties[this.name].properties.find((c) => c.split(":")[1] == property)) {
            const find = properties[this.name].properties.find((c) => c.split(":")[1] == property)
            const index = properties[this.name].properties.indexOf(find)

            world.setDynamicProperty(properties[this.name].properties.find((c) => c.split(":")[1] == property))
            properties[this.name].properties.splice(index, 1)
            console.warn(JSON.stringify(properties[this.name].properties))
        } else {
            return console.warn('Propriety not found')
        }
    }
    clearAll() {
        const properties1 = properties[this.name].properties
        properties1.forEach(p => {
            world.getDynamicPropertyIds().forEach(d => {
                if (p === d) {
                    world.setDynamicProperty(d)
                }
            })
        })
        properties[this.name].properties = []
    }

    clearAllProprieties() {
        properties = []
        world.getDynamicPropertyIds().forEach(d => {
            world.setDynamicProperty(d)
        })
    }
    getAll() {
        return properties[this.name]?.properties.map(p => this.get(p.split(":")[1])) || [];
    }
    update(property, newValue) {
        const currentValue = this.get(property);
        if (currentValue === undefined) return console.warn(`Property "${property}" not found.`);
    
        let updatedValue = (typeof currentValue === "object" && typeof newValue === "object")
            ? { ...currentValue, ...newValue }
            : (Array.isArray(currentValue) && Array.isArray(newValue))
            ? [...currentValue, ...newValue]
            : newValue;
    
        if (JSON.stringify(currentValue) !== JSON.stringify(updatedValue)) {
            world.setDynamicProperty(this.name + ":" + property, JSON.stringify(updatedValue));
            console.log(`Updated "${property}":`, updatedValue);
        }
    }
    sendLogs() {
        let allData = {};
        for (let dbName in properties) { allData[dbName] = properties[dbName].properties.map(prop => { const propertyName = prop.split(":")[1]; const propertyValue = this.get(propertyName); return { [propertyName]: propertyValue }; }); }
        console.debug("Database Logs: ", JSON.stringify(allData, null, 2));
        console.error("Database Logs: ", JSON.stringify(allData, null, 2));
        console.log("Database Logs: ", JSON.stringify(allData, null, 2));
    }
}
