import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "./app";
import {
  CreateNoteInput,
  FilterQueryInput,
  ParamsInput,
  UpdateNoteInput,
  getLastValueInput,
  TypeConsoInput,
} from "./note.schema";

export const createNoteController = async ({
  input,
}: {
  input: CreateNoteInput;
}) => {
  try {
    const note = await prisma.note.create({
      data: {
        title: input.title,
        content: input.content,
        category: input.category,
        published: input.published,
      },
    });

    return {
      status: "success",
      data: {
        note,
      },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Note with that title already exists",
        });
      }
    }
    throw error;
  }
};

export const getLastValueController = async ({
  typeConsoInput,
}: {
  typeConsoInput: TypeConsoInput;
}) => {
  try {
    const lastValue = await prisma.note.findFirst({
      where: { id: typeConsoInput.type },
    });

    return {
      status: "success",
      note: lastValue,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // if (error.code === "P2025") {
      //   throw new TRPCError({
      //     code: "CONFLICT",
      //     message: "Note with that title already exists",
      //   });
      // }
    }
    throw error;
  }
};

export const updateNoteController = async ({
  paramsInput,
  input,
}: {
  paramsInput: ParamsInput;
  input: UpdateNoteInput["body"];
}) => {
  try {
    const updatedNote = await prisma.note.update({
      where: { id: paramsInput.noteId },
      data: input,
    });

    return {
      status: "success",
      note: updatedNote,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Note with that title already exists",
        });
      }
    }
    throw error;
  }
};

export const findNoteController = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: paramsInput.noteId },
    });

    if (!note) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Note with that ID not found",
      });
    }

    return {
      status: "success",
      note,
    };
  } catch (error) {
    throw error;
  }
};

export const findAllNotesController = async ({
  filterQuery,
}: {
  filterQuery: FilterQueryInput;
}) => {
  try {
    const page = filterQuery.page || 1;
    const limit = filterQuery.limit || 10;
    const skip = (page - 1) * limit;

    const notes = await prisma.note.findMany({ skip, take: limit });

    return {
      status: "success",
      results: notes.length,
      notes,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteNoteController = async ({
  paramsInput,
}: {
  paramsInput: ParamsInput;
}) => {
  try {
    await prisma.note.delete({ where: { id: paramsInput.noteId } });

    return {
      status: "success",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note with that ID not found",
        });
      }
    }
    throw error;
  }
};
