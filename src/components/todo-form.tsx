import { FormEvent, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LoadingSwap } from "./ui/loading-swap";
import { PlusIcon } from "lucide-react";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import z from "zod";
import { prisma } from "@/db"; // or wherever you initialize PrismaClient
import { redirect } from "@tanstack/react-router";

const addTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    await prisma.todo.create({
      data: {
        name: data.name,
        isComplete: false,
      },
    });
    throw redirect({ to: "/" });
  });

const updateTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1), name: z.string().min(1) }))
  .handler(async ({ data }) => {
    await prisma.todo.update({
      where: { id: data.id },
      data: { name: data.name },
    });
    throw redirect({ to: "/" });
  });

export function TodoForm({
  todo,
}: {
  todo?: {
    name: string;
    id: string;
  };
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addTodoFn = useServerFn(addTodo);
  const updateTodoFn = useServerFn(updateTodo);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = nameRef.current?.value;
    if (!name) return;

    setIsLoading(true);
    if (todo == null) {
      await addTodoFn({ data: { name } });
    } else {
      await updateTodoFn({ data: { name, id: todo.id } });
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        autoFocus
        ref={nameRef}
        placeholder="Enter your todo..."
        className="flex-1"
        aria-label="Name"
        defaultValue={todo?.name}
      />
      <Button type="submit" disabled={isLoading}>
        <LoadingSwap isLoading={isLoading} className="flex gap-2 items-center">
          {todo == null ? (
            <>
              <PlusIcon /> Add
            </>
          ) : (
            "Update"
          )}
        </LoadingSwap>
      </Button>
    </form>
  );
}
