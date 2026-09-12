namespace collab {
    /**
     * Creates a new collaboration room.
     */
    //% block="create room"
    export function createRoom(): void {
        game.splash("Collab", "Room created!")
    }

    /**
     * Gets the current room code.
     */
    //% block="get room code"
    export function getRoomCode(): string {
        return "TEST1"
    }

    /**
     * Joins a collaboration room.
     */
    //% block="join room %code"
    export function joinRoom(code: string): void {
        game.splash("Joining", code)
    }

    /**
     * Checks whether the user is connected.
     */
    //% block="is connected"
    export function isConnected(): boolean {
        return false
    }
}
