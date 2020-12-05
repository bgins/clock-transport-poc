# Collaborative clock and transport proof-of-concept

This document lays out requirements for a proof-of-concept clock and transport for web audio applications.

## Goals

The goal is to create a simple application where two users collaborate on a shared data structure that syncs over a time-based loop. 

## Definitions

- Server - a backend application that stores and syncs the data structure
- Client - a frontend application that plays and updates its part of the data structure
- Shared Data - the shared data structure
- Local Data - the local version of the data structure. Each client has their own version of Local Data.
- Clock - a thing that keeps time. Each client uses one to play over the data structure.
- Loop Start - the time when the loop is started or restarted after loop end

## Constraints

- Local Data and Shared Data use the same schema
- Clients modify independent parts of the schema. The data structure is shared, but to simplify synchronization, each user can only modify one part of the schema.
- Each user can only modify their Local Data. They send their Local Data to the Server, and the Server updates Shared Data.
- Each user has their own Clock. Clocks do not need to stay in sync with each other.

## Clock

Each Client has a Clock that is used to track time across the loop and determine when to restart the loop. A stable clock implementation is outlined in https://blog.paul.cx/post/metronome/.

## Synchronization

Synchronization occurs on the Server and on the Client.

On the Server:

- The Server may receive Local Data from a Client at any time
- The Server updates the Shared Data with any changes in Local Data
- The Server sends the updated Shared Data to each Client immediately after the update (should the Server send updates to the Client that requested the update?)

On the Client:

- The Client may receive Shared Data from the Server at any time
- The Client syncs their Local Data with Shared Data moments before Loop Start
- The Client sends Local Data updates to the Server immediately after sync but before Loop Start

## Transport

Each Client has a play and a pause button. These transport controls control local activity, but should not interrupt synchronization with Shared Data.

When a Client is playing:

- Their Clock is running
- They play across Local Data
- They send updates to the Server
- The Server sends updates to the Client and the Client updates Local Data

When a Client is paused:

- Their Clock is stopped
- They do not play across Local Data
- They do not send updates to the Server
- The Server sends updates to the Client and the Client updates Local Data

## Persistence

Persistence in memory on both the Client and Server might be enough for the proof-of-concept.

## Non-goals

We are only proving clocks, synchronization, and transport within the Constraints. Clients do not need to have synchronized clocks. This means playing in the same physical location may be out of sync.

We do not need a fancy web audio app. The simplest UI and audio possible will suffice.

We do not need authentication, accounts or any other pieces of a larger application. Users can pull their identity from an environment variable or from `localstorage`.
