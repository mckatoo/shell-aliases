import { describe, expect, spyOn, mock, test, jest, afterAll, beforeAll } from "bun:test";
import { Command } from "commander";
import addAlias from ".";
import fs from "fs";
import child_process from "child_process"
import { ALIASES_PATH, UID } from "src/utils/envs";


const readFileSyncSpy = spyOn(fs, 'readFileSync')
const appendFileSyncSpy = spyOn(fs, 'appendFileSync')
const execSyncSpy = spyOn(child_process, 'execSync')
const writeSpy = spyOn(process.stdout, 'write')

describe("Add alias", () => {
    beforeAll(() => {
        readFileSyncSpy.mockImplementation(jest.fn().mockReturnValue(''))
        appendFileSyncSpy.mockImplementation(jest.fn())
        execSyncSpy.mockImplementation(jest.fn().mockReturnValue(null))
        writeSpy.mockImplementation(jest.fn().mockReturnValue(''))
    })

    afterAll(() => {
        mock.restore()
    })

    test("When arguments includes -- then stop processing options", () => {
        const app = new Command("aliases");
        app.exitOverride()
        addAlias(app)
        app.parse(["node", "aliases", "add", "-n l", "-c ls", "--", "--type", "list"]);
        const opts = app.commands[0].opts()
        const args = app.commands[0].args
        const name = opts.name.replace(" ", "")

        expect(name).toBe("l");
        expect(opts.type).toBeUndefined();
        expect(args).toEqual(["--type", "list"]);
    });

    test("Unknown option, then handle error", () => {
        const program = new Command();
        program.exitOverride()
        program
            .exitOverride()
            .command("add")
            .action(() => { });

        let caughtErr: any;
        try {
            program.parse(["node", "aliases", "add", "--color"]);
        } catch (err) {
            caughtErr = err;
        }
        expect(caughtErr.code).toBe("commander.unknownOption");
    });

    test("Unknown command, then handle error", () => {
        const program = new Command();
        program.exitOverride()
        addAlias(program)
        let caughtErr: any;
        try {
            program.parse(["node", "aliases", "list"]);
        } catch (err) {
            caughtErr = err;
        }
        expect(caughtErr.code).toBe("commander.unknownCommand");
    });

    test("Success on add alias", () => {
        const program = new Command();
        program.exitOverride()
        addAlias(program)
        program.parse(["node", "aliases", "add", "-n l", '-c exa -l']);
        const alias = "alias  l=\" exa -l\""
        const opts = program.commands[0].opts()
        const name = opts.name.replace(" ", "")
        const command = opts.command.replace(" ", "")

        expect(name).toBe('l')
        expect(command).toBe('exa -l')
        expect(appendFileSyncSpy).toHaveBeenLastCalledWith(ALIASES_PATH, alias)
        expect(writeSpy).toHaveBeenCalledWith(alias)
    })
})