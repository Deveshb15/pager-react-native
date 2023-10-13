import { useMemo } from "react";

import { addHours } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import useFirebase from "@hooks/useFirebase";
import useCoreAction from "@hooks/useCoreAction";
import useOptimisticUpdate from "@hooks/useOptimisticUpdate";

export default function useMarkFree(props = {}) {
  const { onSuccess } = props;
  const { user } = useFirebase();
  const queryClient = useQueryClient();
  const update = useOptimisticUpdate();
  const { markFree } = useCoreAction();

  const { isLoading, mutate } = useMutation(() => markFree(user?.uid), {
    onMutate: () => {
      update(["user", user?.uid], (old) => ({
        ...old,
        markedFreeTill: addHours(new Date(), 1).getTime(),
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user", user?.uid]);

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  return useMemo(
    () => ({
      markingFree: isLoading,
      markFree: mutate,
    }),
    [isLoading, mutate],
  );
}
