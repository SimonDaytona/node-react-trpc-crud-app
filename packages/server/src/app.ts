import express from "express";
import morgan from "morgan";
import cors from "cors";
import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { PrismaClient } from "@prisma/client";
import {
  createNoteSchema,
  filterQuery,
  params,
  updateNoteSchema,
  typeConso,
} from "./note.schema";
import {
  createNoteController,
  deleteNoteController,
  findAllNotesController,
  findNoteController,
  updateNoteController,
  getLastValueController,
} from "./note.controller";

export const prisma = new PrismaClient();
const t = initTRPC.create();

const appRouter = t.router({
  getHello: t.procedure.query((req) => {
    return { message: "Welcome to Full-Stack tRPC CRUD App" };
  }),
  createNote: t.procedure
    .input(createNoteSchema)
    .mutation(({ input }) => createNoteController({ input })),
  updateNote: t.procedure
    .input(updateNoteSchema)
    .mutation(({ input }) =>
      updateNoteController({ paramsInput: input.params, input: input.body })
    ),
  deleteNote: t.procedure
    .input(params)
    .mutation(({ input }) => deleteNoteController({ paramsInput: input })),
  getNote: t.procedure
    .input(params)
    .query(({ input }) => findNoteController({ paramsInput: input })),
  getNotes: t.procedure
    .input(filterQuery)
    .query(({ input }) => findAllNotesController({ filterQuery: input })),
  getLastValue: t.procedure
    .input(typeConso)
    .query(({ input }) => getLastValueController({ typeConsoInput: input })),
});

export type AppRouter = typeof appRouter;

const app = express();
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

const port = 8000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
