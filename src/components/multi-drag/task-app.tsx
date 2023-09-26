import { useEffect, useState } from "react";
import { DragDropContext, DragStart, DropResult } from "react-beautiful-dnd";
import styled from "@emotion/styled";

import initial from "./data";
import Column from "./column";
import type { Result as ReorderResult } from "./utils";
import { mutliDragAwareReorder, multiSelectTo as multiSelect } from "./utils";
import type { Task, Id } from "./common-types";
import type { Entities } from "./types";

const getTasks = (entities: Entities, columnId: Id): Task[] =>
  entities.columns[columnId].taskIds.map(
    (taskId: Id): Task => entities.tasks[taskId]
  );

const Container = styled.div`
  display: flex;
  user-select: none;
`;

const TaskApp = () => {
  const [entities, setEntities] = useState(initial);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Id[]>([]);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  useEffect(() => {
    window.addEventListener("click", onWindowClick);
    window.addEventListener("keydown", onWindowKeyDown);
    window.addEventListener("touchend", onWindowTouchEnd);
    return () => {
      window.removeEventListener("click", onWindowClick);
      window.removeEventListener("keydown", onWindowKeyDown);
      window.removeEventListener("touchend", onWindowTouchEnd);
    };
  }, []);

  const onDragStart = (start: DragStart) => {
    const id: string = start.draggableId;
    const selected: Id = selectedTaskIds.find(
      (taskId: Id): boolean => taskId === id
    )!;

    // if dragging an item that is not selected - unselect all items
    if (!selected) {
      unselectAll();
    }
    setDraggingTaskId(start.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // nothing to do
    if (!destination || result.reason === "CANCEL") {
      setDraggingTaskId(null);
      return;
    }

    const {
      entities: ResRetities,
      selectedTaskIds: ResSelectedTaskIds,
    }: ReorderResult = mutliDragAwareReorder({
      entities,
      selectedTaskIds,
      source,
      destination,
    });
    console.log("ResRetities", entities, ResRetities);
    console.log("ResSelectedTaskIds", selectedTaskIds, ResSelectedTaskIds);
    setEntities(ResRetities);
    setSelectedTaskIds(ResSelectedTaskIds);
    setDraggingTaskId(null);
  };

  const onWindowKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape") {
      unselectAll();
    }
  };

  const onWindowClick = (event: MouseEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  };

  const onWindowTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  };

  const toggleSelection = (taskId: Id) => {
    const wasSelected: boolean = selectedTaskIds.includes(taskId);

    const newTaskIds: Id[] = (() => {
      // Task was not previously selected
      // now will be the only selected item
      if (!wasSelected) {
        return [taskId];
      }

      // Task was part of a selected group
      // will now become the only selected item
      if (selectedTaskIds.length > 1) {
        return [taskId];
      }

      // task was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    setSelectedTaskIds(newTaskIds);
  };

  const toggleSelectionInGroup = (taskId: Id) => {
    const index: number = selectedTaskIds.indexOf(taskId);

    // if not selected - add it to the selected items
    if (index === -1) {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
      return;
    }

    // it was previously selected and now needs to be removed from the group
    const shallow: Id[] = [...selectedTaskIds];
    shallow.splice(index, 1);
    setSelectedTaskIds(shallow);
  };

  // This behaviour matches the MacOSX finder selection
  const multiSelectTo = (newTaskId: Id) => {
    const updated: Id[] = multiSelect(entities, selectedTaskIds, newTaskId);

    if (updated == null) {
      return;
    }

    setSelectedTaskIds(updated);
  };

  const unselectAll = () => {
    setSelectedTaskIds([]);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
        }}
      >
        <div>
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Container>
              {entities.columnOrder.map((columnId: Id) => (
                <Column
                  column={entities.columns[columnId]}
                  tasks={getTasks(entities, columnId)}
                  selectedTaskIds={selectedTaskIds}
                  key={columnId}
                  draggingTaskId={draggingTaskId}
                  toggleSelection={toggleSelection}
                  toggleSelectionInGroup={toggleSelectionInGroup}
                  multiSelectTo={multiSelectTo}
                />
              ))}
            </Container>
          </DragDropContext>
        </div>

        <div>
          <iframe
            style={{
              width: "500px",
              height: "500px",
            }}
            src="https://www.baidu.com"
            title="qwe"
          />
        </div>
      </div>
    </>
  );
};
export default TaskApp;
