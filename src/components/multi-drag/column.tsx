// @flow
import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import { colors } from '@atlaskit/theme';
import styled from '@emotion/styled';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

import type { Column as ColumnType } from './types';
import type { Task as TaskType, Id } from './common-types';
import Task from './task';
import { borderRadius, grid } from './constants';

interface IProps {
  column: ColumnType;
  tasks: TaskType[];
  selectedTaskIds: Id[];
  draggingTaskId: Id | null;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id) => void;
}

// $ExpectError - not sure why
interface TaskIdMap {
  [taskId: Id]: true;
}

const getSelectedMap = memoizeOne((selectedTaskIds: Id[]) =>
  selectedTaskIds.reduce((previous: TaskIdMap, current: Id): TaskIdMap => {
    previous[current] = true;
    return previous;
  }, {})
);

// $ExpectError - not sure why
const Container = styled.div`
  width: 300px;
  margin: ${grid}px;
  border-radius: ${borderRadius}px;
  border: 1px solid ${colors.N100};
  background-color: ${colors.N50};

  /* we want the column to take up its full height */
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-weight: bold;
  padding: ${grid}px;
`;

const TaskList: any = styled.div`
  padding: ${grid}px;
  min-height: 200px;
  flex-grow: 1;
  transition: background-color 0.2s ease;
  ${(props: any) => (props.isDraggingOver ? `background-color: ${colors.N200}` : '')};
`;

const Column = (props: IProps) => {
  const { column, tasks, selectedTaskIds, draggingTaskId, toggleSelectionInGroup, toggleSelection, multiSelectTo } =
    props;
  return (
    <Container>
      <Title>{column.title}</Title>
      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <TaskList ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver} {...provided.droppableProps}>
            {tasks.map((task: TaskType, index: number) => {
              const isSelected = Boolean(getSelectedMap(selectedTaskIds)[task.id]);
              const isGhosting: boolean = isSelected && Boolean(draggingTaskId) && draggingTaskId !== task.id;
              return (
                <Task
                  task={task}
                  index={index}
                  key={task.id}
                  isSelected={isSelected}
                  isGhosting={isGhosting}
                  selectionCount={selectedTaskIds.length}
                  toggleSelection={toggleSelection}
                  toggleSelectionInGroup={toggleSelectionInGroup}
                  multiSelectTo={multiSelectTo}
                />
              );
            })}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </Container>
  );
};

export default Column;
