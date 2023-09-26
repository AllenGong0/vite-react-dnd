// @flow
import { colors } from "@atlaskit/theme";
import styled from "@emotion/styled";

import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import type { Id, Task as TaskType } from "./common-types";
import { borderRadius, grid, size } from "./constants";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const primaryButton = 0;

interface Props {
  task: TaskType;
  index: number;
  isSelected: boolean;
  isGhosting: boolean;
  selectionCount: number;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id) => void;
}

interface GetBackgroundColorArgs {
  isSelected: boolean;
  isDragging: boolean;
  isGhosting: boolean;
}

const getBackgroundColor = ({
  isSelected,
  isGhosting,
}: GetBackgroundColorArgs): string => {
  if (isGhosting) {
    return colors.N10;
  }

  if (isSelected) {
    return colors.B50;
  }

  return colors.N10;
};

const getColor = ({ isSelected, isGhosting }: any): string => {
  if (isGhosting) {
    return "darkgrey";
  }
  if (isSelected) {
    return colors.B200;
  }
  return colors.N900;
};

const Container = styled.div`
  background-color: ${(props) => getBackgroundColor(props as any)};
  color: ${(props) => getColor(props)};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
  border-radius: ${borderRadius}px;
  font-size: 18px;
  border: 3px solid ${colors.N90};
  ${(props: any) =>
    props.isDragging ? `box-shadow: 2px 2px 1px ${colors.N90};` : ""} ${(
    props: any
  ) => (props.isGhosting ? "opacity: 0.8;" : "")}

  /* needed for SelectionCount */
  position: relative;

  /* avoid default outline which looks lame with the position: absolute; */
  &:focus {
    outline: none;
    border-color: ${colors.G200};
  }
`;

const SelectionCount = styled.div`
  right: -${grid}px;
  top: -${grid}px;
  color: ${colors.N0};
  background: ${colors.N200};
  border-radius: 50%;
  height: ${size}px;
  width: ${size}px;
  line-height: ${size}px;
  position: absolute;
  text-align: center;
  font-size: 0.8rem;
`;

/* stylelint-enable */

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};

const Task = (props: Props) => {
  const {
    task,
    index,
    isSelected,
    selectionCount,
    isGhosting,
    toggleSelectionInGroup,
  } = props;
  const onKeyDown = (
    event: KeyboardEvent,
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot
  ) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();

    performAction(event);
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  const onClick = (event: any) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    performAction(event);
  };

  const onTouchEnd = (event: any) => {
    if (event.defaultPrevented) {
      return;
    }

    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    toggleSelectionInGroup(task.id);
  };

  // Determines if the platform specific toggle selection in group key was used
  const wasToggleInSelectionGroupKeyUsed = (
    event: MouseEvent | KeyboardEvent
  ) => {
    return navigator.platform.includes("Win") ? event.ctrlKey : event.metaKey;
  };

  // Determines if the multiSelect key was used
  const wasMultiSelectKeyUsed = (event: MouseEvent | KeyboardEvent) =>
    event.shiftKey;

  const performAction = (event: MouseEvent | KeyboardEvent) => {
    const { task, toggleSelection, toggleSelectionInGroup, multiSelectTo } =
      props;

    if (wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(task.id);
      return;
    }

    if (wasMultiSelectKeyUsed(event)) {
      multiSelectTo(task.id);
      return;
    }

    toggleSelection(task.id);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
        const shouldShowSelection: boolean =
          snapshot.isDragging && selectionCount > 1;

        return (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            onTouchEnd={onTouchEnd}
            onKeyDown={(event: any) => onKeyDown(event, provided, snapshot)}
            isDragging={snapshot.isDragging}
            isSelected={isSelected}
            isGhosting={isGhosting}
          >
            <div>{task.content}</div>
            {shouldShowSelection ? (
              <SelectionCount>{selectionCount}</SelectionCount>
            ) : null}
          </Container>
        );
      }}
    </Draggable>
  );
};

export default Task;
