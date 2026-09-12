namespace collab {
    //% block="create room"
    export function createRoom(): void {
        game.splash("Use the Collab website to create a room!")
    }

    //% block="join room %code"
    export function joinRoom(code: string): void {
        game.splash("Join code:", code)
    }

    //% block="get room code"
    export function getRoomCode(): string {
        return ""
    }

    //% block="is connected"
    export function isConnected(): boolean {
        return false
    }
}
