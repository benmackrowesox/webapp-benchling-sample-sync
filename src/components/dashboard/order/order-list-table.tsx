import type { ChangeEvent, FC, MouseEvent } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  useTheme,
} from "@mui/material";
import type { NewOrder, OrderStatus } from "../../../types/order";
import type { SeverityPillColor } from "../../severity-pill";
import { useTypedAuth } from "src/hooks/use-auth";
import { InternalUser } from "src/types/user";
import { OrderRow } from "./order-row";

interface OrderListTableProps {
  onOpenDrawer?: (
    orderId: string,
    status: OrderStatus,
    allSamplesSubmitted: boolean,
  ) => void;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onOrderChanged: (updatedOrder: NewOrder) => void;
  orders: NewOrder[];
  ordersCount: number;
  page: number;
  rowsPerPage: number;
}

export const orderSeverityMap: { [key: string]: SeverityPillColor } = {
  "kit-arrived": "success",
  "kit-sent": "info",
  approved: "warning",
  reviewing: "error",
};

export const sampleSeverityMap: { [key: string]: SeverityPillColor } = {
  "sample-collected": "warning",
  "sample-returned": "error",
  processing: "info",
  complete: "success",
};

export interface OrderRowProps {
  order: NewOrder;
  onOpenDrawer?: (
    orderId: string,
    status: OrderStatus,
    allSamplesSubmitted: boolean,
  ) => void;
  onOrderChanged: (updatedOrder: NewOrder) => void;
  theme: Theme;
  user: InternalUser | null;
}

export const OrderListTable: FC<OrderListTableProps> = (props) => {
  const {
    onOpenDrawer,
    onPageChange,
    onRowsPerPageChange,
    onOrderChanged,
    orders,
    ordersCount,
    page,
    rowsPerPage,
    ...other
  } = props;
  const theme = useTheme();
  const { user } = useTypedAuth();

  return (
    <div {...other}>
      <Box sx={{ overflow: "auto" }}>
        <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ p: 0, pl: -0.5, width: 0 }} />
                <TableCell sx={{ p: 0, pl: "4px", width: 0 }}>Date</TableCell>
                <TableCell sx={{ pl: 1 }}>Order No.</TableCell>
                <TableCell sx={{ pl: 1 }}>Title</TableCell>
                <TableCell sx={{ pl: 1 }}>Description</TableCell>
                <TableCell sx={{ p: 0 }} align={"right"}>
                  Samples
                </TableCell>
                <TableCell sx={{ pl: 1 }} align={"right"}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onOpenDrawer={onOpenDrawer}
                  onOrderChanged={onOrderChanged}
                  theme={theme}
                  user={user}
                />
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={ordersCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Box>
    </div>
  );
};

OrderListTable.propTypes = {
  onOpenDrawer: PropTypes.func,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  orders: PropTypes.array.isRequired,
  ordersCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
